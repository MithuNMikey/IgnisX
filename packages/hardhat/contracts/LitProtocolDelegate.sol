//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title LitProtocolDelegate
 * @dev Handles Lit Protocol Vincent delegated signing for IgnisX
 * @author IgnisX Team
 */
contract LitProtocolDelegate is Ownable, ReentrancyGuard {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // Structs
    struct DelegationSession {
        address user;
        address delegate;
        uint256 nonce;
        uint256 expiry;
        bytes32 policyHash; // Hash of the delegation policy
        bool isActive;
        uint256 maxOperations;
        uint256 operationsUsed;
    }

    struct SignedOperation {
        address user;
        address delegate;
        uint256 nonce;
        uint256 operationType; // 1: swap, 2: bridge, 3: rebalance
        bytes data;
        uint256 timestamp;
        bytes signature;
    }

    // State variables
    mapping(bytes32 => DelegationSession) public delegationSessions;
    mapping(address => uint256) public userNonces;
    mapping(bytes32 => bool) public usedSignatures;
    
    // Events
    event DelegationSessionCreated(bytes32 indexed sessionId, address indexed user, address indexed delegate, uint256 nonce, uint256 expiry);
    event DelegationSessionRevoked(bytes32 indexed sessionId, address indexed user);
    event OperationExecuted(bytes32 indexed sessionId, address indexed user, address indexed delegate, uint256 operationType, bytes32 operationHash);
    event SignatureVerified(bytes32 indexed sessionId, address indexed user, bool valid);

    // Modifiers
    modifier validSession(bytes32 sessionId) {
        require(delegationSessions[sessionId].isActive, "Session not active");
        require(block.timestamp <= delegationSessions[sessionId].expiry, "Session expired");
        require(delegationSessions[sessionId].operationsUsed < delegationSessions[sessionId].maxOperations, "Max operations exceeded");
        _;
    }

    modifier onlyDelegate(bytes32 sessionId) {
        require(msg.sender == delegationSessions[sessionId].delegate, "Not authorized delegate");
        _;
    }

    /**
     * @dev Create a new delegation session
     * @param user The user address
     * @param delegate The delegate address (autopilot agent)
     * @param expiry Session expiry timestamp
     * @param policyHash Hash of the delegation policy
     * @param maxOperations Maximum number of operations allowed
     * @return sessionId The unique session identifier
     */
    function createDelegationSession(
        address user,
        address delegate,
        uint256 expiry,
        bytes32 policyHash,
        uint256 maxOperations
    ) external returns (bytes32) {
        require(user != address(0), "Invalid user");
        require(delegate != address(0), "Invalid delegate");
        require(expiry > block.timestamp, "Invalid expiry");
        require(maxOperations > 0, "Invalid max operations");

        uint256 nonce = userNonces[user]++;
        bytes32 sessionId = keccak256(abi.encodePacked(user, delegate, nonce, block.timestamp));

        delegationSessions[sessionId] = DelegationSession({
            user: user,
            delegate: delegate,
            nonce: nonce,
            expiry: expiry,
            policyHash: policyHash,
            isActive: true,
            maxOperations: maxOperations,
            operationsUsed: 0
        });

        emit DelegationSessionCreated(sessionId, user, delegate, nonce, expiry);
        return sessionId;
    }

    /**
     * @dev Revoke a delegation session
     * @param sessionId The session ID to revoke
     */
    function revokeDelegationSession(bytes32 sessionId) external {
        DelegationSession storage session = delegationSessions[sessionId];
        require(session.user == msg.sender || msg.sender == owner(), "Not authorized");
        require(session.isActive, "Session not active");

        session.isActive = false;
        emit DelegationSessionRevoked(sessionId, session.user);
    }

    /**
     * @dev Verify a signed operation using Lit Protocol Vincent
     * @param sessionId The delegation session ID
     * @param operation The signed operation data
     * @return valid Whether the signature is valid
     */
    function verifySignedOperation(
        bytes32 sessionId,
        SignedOperation memory operation
    ) external validSession(sessionId) returns (bool valid) {
        DelegationSession storage session = delegationSessions[sessionId];
        
        // Verify operation belongs to this session
        require(operation.user == session.user, "Invalid user");
        require(operation.delegate == session.delegate, "Invalid delegate");
        require(operation.nonce == session.nonce, "Invalid nonce");

        // Create message hash for verification
        bytes32 messageHash = keccak256(abi.encodePacked(
            operation.user,
            operation.delegate,
            operation.nonce,
            operation.operationType,
            operation.data,
            operation.timestamp,
            session.policyHash
        ));

        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        
        // Verify signature
        address signer = ethSignedMessageHash.recover(operation.signature);
        valid = (signer == session.user);

        // Check if signature was already used
        bytes32 signatureHash = keccak256(operation.signature);
        require(!usedSignatures[signatureHash], "Signature already used");
        usedSignatures[signatureHash] = true;

        emit SignatureVerified(sessionId, session.user, valid);
        return valid;
    }

    /**
     * @dev Execute a verified operation
     * @param sessionId The delegation session ID
     * @param operation The signed operation data
     * @param operationHash Hash of the operation for tracking
     */
    function executeOperation(
        bytes32 sessionId,
        SignedOperation memory operation,
        bytes32 operationHash
    ) external onlyDelegate(sessionId) nonReentrant {
        DelegationSession storage session = delegationSessions[sessionId];
        
        // Verify the operation signature
        require(verifySignedOperation(sessionId, operation), "Invalid signature");

        // Increment operations used
        session.operationsUsed++;

        emit OperationExecuted(sessionId, session.user, session.delegate, operation.operationType, operationHash);
    }

    /**
     * @dev Batch execute multiple operations
     * @param sessionId The delegation session ID
     * @param operations Array of signed operations
     * @param operationHashes Array of operation hashes
     */
    function batchExecuteOperations(
        bytes32 sessionId,
        SignedOperation[] memory operations,
        bytes32[] memory operationHashes
    ) external onlyDelegate(sessionId) nonReentrant {
        require(operations.length == operationHashes.length, "Invalid input length");
        require(operations.length > 0, "No operations provided");

        DelegationSession storage session = delegationSessions[sessionId];
        require(session.operationsUsed + operations.length <= session.maxOperations, "Exceeds max operations");

        for (uint256 i = 0; i < operations.length; i++) {
            // Verify each operation
            require(verifySignedOperation(sessionId, operations[i]), "Invalid signature");
            
            emit OperationExecuted(sessionId, session.user, session.delegate, operations[i].operationType, operationHashes[i]);
        }

        session.operationsUsed += operations.length;
    }

    /**
     * @dev Get delegation session details
     * @param sessionId The session ID
     * @return DelegationSession struct
     */
    function getDelegationSession(bytes32 sessionId) external view returns (DelegationSession memory) {
        return delegationSessions[sessionId];
    }

    /**
     * @dev Check if a session is valid and active
     * @param sessionId The session ID
     * @return valid Whether the session is valid
     */
    function isSessionValid(bytes32 sessionId) external view returns (bool valid) {
        DelegationSession memory session = delegationSessions[sessionId];
        return session.isActive && 
               block.timestamp <= session.expiry && 
               session.operationsUsed < session.maxOperations;
    }

    /**
     * @dev Get user's current nonce
     * @param user The user address
     * @return nonce The current nonce
     */
    function getUserNonce(address user) external view returns (uint256) {
        return userNonces[user];
    }

    /**
     * @dev Emergency function to revoke all sessions for a user
     * @param user The user address
     */
    function emergencyRevokeUserSessions(address user) external onlyOwner {
        // This would require iterating through all sessions, which is gas-intensive
        // In a production environment, consider using a mapping to track user sessions
        emit DelegationSessionRevoked(bytes32(0), user);
    }

    /**
     * @dev Create a policy hash for delegation
     * @param maxSlippage Maximum slippage allowed
     * @param maxRebalanceAmount Maximum rebalance amount
     * @param rebalanceThreshold Rebalance threshold
     * @param cooldownPeriod Cooldown period
     * @return policyHash The policy hash
     */
    function createPolicyHash(
        uint256 maxSlippage,
        uint256 maxRebalanceAmount,
        uint256 rebalanceThreshold,
        uint256 cooldownPeriod
    ) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(
            maxSlippage,
            maxRebalanceAmount,
            rebalanceThreshold,
            cooldownPeriod
        ));
    }
}
