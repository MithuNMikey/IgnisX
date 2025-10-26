//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./PortfolioManager.sol";
import "./CrossChainRebalancer.sol";
import "./LitProtocolDelegate.sol";

/**
 * @title IgnisX
 * @dev Main contract that orchestrates the IgnisX portfolio autopilot system
 * @author IgnisX Team
 */
contract IgnisX is Ownable, ReentrancyGuard {
    // State variables
    PortfolioManager public portfolioManager;
    CrossChainRebalancer public rebalancer;
    LitProtocolDelegate public litDelegate;
    
    // Events
    event SystemInitialized(address portfolioManager, address rebalancer, address litDelegate);
    event AutopilotEnabled(address indexed user, bytes32 sessionId);
    event AutopilotDisabled(address indexed user);
    event RebalancingTriggered(address indexed user, bytes32 actionId, uint256 drift);

    constructor() {
        // Deploy core contracts
        portfolioManager = new PortfolioManager();
        rebalancer = new CrossChainRebalancer(address(portfolioManager));
        litDelegate = new LitProtocolDelegate();
        
        // Transfer ownership of sub-contracts to this contract
        portfolioManager.transferOwnership(address(this));
        rebalancer.transferOwnership(address(this));
        litDelegate.transferOwnership(address(this));
        
        emit SystemInitialized(address(portfolioManager), address(rebalancer), address(litDelegate));
    }

    /**
     * @dev Enable autopilot for a user with Lit Protocol delegation
     * @param user The user address
     * @param maxSlippage Maximum slippage allowed (basis points)
     * @param maxRebalanceAmount Maximum rebalance amount (USD, scaled by 1e18)
     * @param rebalanceThreshold Rebalance threshold (basis points)
     * @param cooldownPeriod Cooldown period (seconds)
     * @param sessionExpiry Delegation session expiry timestamp
     * @param maxOperations Maximum operations per session
     * @return sessionId The Lit Protocol delegation session ID
     */
    function enableAutopilot(
        address user,
        uint256 maxSlippage,
        uint256 maxRebalanceAmount,
        uint256 rebalanceThreshold,
        uint256 cooldownPeriod,
        uint256 sessionExpiry,
        uint256 maxOperations
    ) external returns (bytes32) {
        require(msg.sender == user || msg.sender == owner(), "Not authorized");
        
        // Create delegation policy hash
        bytes32 policyHash = litDelegate.createPolicyHash(
            maxSlippage,
            maxRebalanceAmount,
            rebalanceThreshold,
            cooldownPeriod
        );
        
        // Create Lit Protocol delegation session
        bytes32 sessionId = litDelegate.createDelegationSession(
            user,
            address(rebalancer), // Use rebalancer as delegate
            sessionExpiry,
            policyHash,
            maxOperations
        );
        
        // Set delegation policy in PortfolioManager
        portfolioManager.setDelegationPolicy(
            user,
            address(rebalancer),
            maxSlippage,
            maxRebalanceAmount,
            rebalanceThreshold,
            cooldownPeriod
        );
        
        emit AutopilotEnabled(user, sessionId);
        return sessionId;
    }

    /**
     * @dev Disable autopilot for a user
     * @param user The user address
     */
    function disableAutopilot(address user) external {
        require(msg.sender == user || msg.sender == owner(), "Not authorized");
        
        // Revoke delegation in PortfolioManager
        portfolioManager.revokeDelegation(user);
        
        emit AutopilotDisabled(user);
    }

    /**
     * @dev Trigger rebalancing for a user (called by autopilot agent)
     * @param user The user address
     * @param swaps Array of swap parameters
     * @param bridges Array of bridge parameters
     * @param totalValue Total portfolio value (USD, scaled by 1e18)
     * @param sessionId Lit Protocol session ID
     * @param operationSignature Signed operation data
     * @return actionId The rebalancing action ID
     */
    function triggerRebalancing(
        address user,
        CrossChainRebalancer.SwapParams[] memory swaps,
        CrossChainRebalancer.BridgeParams[] memory bridges,
        uint256 totalValue,
        bytes32 sessionId,
        LitProtocolDelegate.SignedOperation memory operationSignature
    ) external returns (bytes32) {
        // Verify Lit Protocol session
        require(litDelegate.isSessionValid(sessionId), "Invalid session");
        
        // Execute the signed operation
        bytes32 operationHash = keccak256(abi.encodePacked(user, totalValue, block.timestamp));
        litDelegate.executeOperation(sessionId, operationSignature, operationHash);
        
        // Create rebalancing action
        bytes32 actionId = rebalancer.createRebalanceAction(user, swaps, bridges, totalValue);
        
        emit RebalancingTriggered(user, actionId, 0); // Drift calculation would be done off-chain
        
        return actionId;
    }

    /**
     * @dev Execute swaps for a rebalancing action
     * @param actionId The rebalancing action ID
     * @param swapIndex The swap index
     * @param actualAmountOut The actual amount received
     * @param sessionId Lit Protocol session ID
     * @param operationSignature Signed operation data
     */
    function executeSwap(
        bytes32 actionId,
        uint256 swapIndex,
        uint256 actualAmountOut,
        bytes32 sessionId,
        LitProtocolDelegate.SignedOperation memory operationSignature
    ) external {
        CrossChainRebalancer.RebalanceAction memory action = rebalancer.getRebalanceAction(actionId);
        
        // Verify Lit Protocol session
        require(litDelegate.isSessionValid(sessionId), "Invalid session");
        
        // Execute the signed operation
        bytes32 operationHash = keccak256(abi.encodePacked(actionId, swapIndex, actualAmountOut, block.timestamp));
        litDelegate.executeOperation(sessionId, operationSignature, operationHash);
        
        // Execute the swap
        rebalancer.executeSwap(actionId, swapIndex, actualAmountOut);
    }

    /**
     * @dev Execute bridges for a rebalancing action
     * @param actionId The rebalancing action ID
     * @param bridgeIndex The bridge index
     * @param actualAmount The actual amount bridged
     * @param sessionId Lit Protocol session ID
     * @param operationSignature Signed operation data
     */
    function executeBridge(
        bytes32 actionId,
        uint256 bridgeIndex,
        uint256 actualAmount,
        bytes32 sessionId,
        LitProtocolDelegate.SignedOperation memory operationSignature
    ) external {
        CrossChainRebalancer.RebalanceAction memory action = rebalancer.getRebalanceAction(actionId);
        
        // Verify Lit Protocol session
        require(litDelegate.isSessionValid(sessionId), "Invalid session");
        
        // Execute the signed operation
        bytes32 operationHash = keccak256(abi.encodePacked(actionId, bridgeIndex, actualAmount, block.timestamp));
        litDelegate.executeOperation(sessionId, operationSignature, operationHash);
        
        // Execute the bridge
        rebalancer.executeBridge(actionId, bridgeIndex, actualAmount);
    }

    /**
     * @dev Complete a rebalancing action
     * @param actionId The rebalancing action ID
     * @param sessionId Lit Protocol session ID
     * @param operationSignature Signed operation data
     */
    function completeRebalancing(
        bytes32 actionId,
        bytes32 sessionId,
        LitProtocolDelegate.SignedOperation memory operationSignature
    ) external {
        CrossChainRebalancer.RebalanceAction memory action = rebalancer.getRebalanceAction(actionId);
        
        // Verify Lit Protocol session
        require(litDelegate.isSessionValid(sessionId), "Invalid session");
        
        // Execute the signed operation
        bytes32 operationHash = keccak256(abi.encodePacked(actionId, "complete", block.timestamp));
        litDelegate.executeOperation(sessionId, operationSignature, operationHash);
        
        // Complete the rebalancing
        rebalancer.completeRebalanceAction(actionId);
    }

    /**
     * @dev Update token prices (called by price oracle)
     * @param chainId The chain ID
     * @param token The token address
     * @param price The price in USD (scaled by 1e18)
     */
    function updateTokenPrice(uint256 chainId, address token, uint256 price) external onlyOwner {
        rebalancer.updateTokenPrice(chainId, token, price);
    }

    /**
     * @dev Authorize an autopilot agent
     * @param agent The agent address
     * @param authorized Whether the agent is authorized
     */
    function setAuthorizedAgent(address agent, bool authorized) external onlyOwner {
        rebalancer.setAuthorizedAgent(agent, authorized);
    }

    /**
     * @dev Get user's portfolio information
     * @param user The user address
     * @return Portfolio struct
     */
    function getUserPortfolio(address user) external view returns (PortfolioManager.Portfolio memory) {
        return portfolioManager.getPortfolio(user);
    }

    /**
     * @dev Get user's delegation policy
     * @param user The user address
     * @return DelegationPolicy struct
     */
    function getUserDelegationPolicy(address user) external view returns (PortfolioManager.DelegationPolicy memory) {
        return portfolioManager.getDelegationPolicy(user);
    }

    /**
     * @dev Check if user needs rebalancing
     * @param user The user address
     * @param currentAllocations Current allocation percentages (basis points)
     * @return bool True if rebalancing is needed
     */
    function needsRebalancing(address user, uint256[] memory currentAllocations) external view returns (bool) {
        return portfolioManager.needsRebalancing(user, currentAllocations);
    }

    /**
     * @dev Calculate portfolio drift
     * @param user The user address
     * @param tokens Array of token addresses
     * @param currentBalances Array of current balances
     * @return driftPercentages Array of drift percentages (basis points)
     */
    function calculateDrift(
        address user,
        address[] memory tokens,
        uint256[] memory currentBalances
    ) external view returns (uint256[] memory) {
        return rebalancer.calculateDrift(user, tokens, currentBalances);
    }

    /**
     * @dev Emergency pause function
     * @param actionId The action ID to pause
     */
    function emergencyPause(bytes32 actionId) external onlyOwner {
        rebalancer.emergencyPause(actionId);
    }
}
