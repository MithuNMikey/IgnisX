//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./PortfolioManager.sol";

/**
 * @title CrossChainRebalancer
 * @dev Handles cross-chain rebalancing operations using Avail Nexus SDK
 * @author IgnisX Team
 */
contract CrossChainRebalancer is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Structs
    struct SwapParams {
        address tokenIn;
        address tokenOut;
        uint256 amountIn;
        uint256 minAmountOut;
        uint256 chainId;
        bytes32 routeId; // Avail Nexus route identifier
    }

    struct BridgeParams {
        address token;
        uint256 amount;
        uint256 fromChainId;
        uint256 toChainId;
        bytes32 bridgeId; // Avail Nexus bridge identifier
    }

    struct RebalanceAction {
        address user;
        SwapParams[] swaps;
        BridgeParams[] bridges;
        uint256 totalValue;
        uint256 timestamp;
        bool executed;
    }

    // State variables
    PortfolioManager public portfolioManager;
    mapping(bytes32 => RebalanceAction) public rebalanceActions;
    mapping(address => bool) public authorizedAgents;
    mapping(uint256 => mapping(address => uint256)) public chainTokenPrices; // chainId => token => price (USD, scaled by 1e18)
    
    // Events
    event RebalanceActionCreated(bytes32 indexed actionId, address indexed user, uint256 totalValue);
    event SwapExecuted(bytes32 indexed actionId, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut, uint256 chainId);
    event BridgeExecuted(bytes32 indexed actionId, address token, uint256 amount, uint256 fromChainId, uint256 toChainId);
    event RebalanceActionExecuted(bytes32 indexed actionId, address indexed user);
    event AgentAuthorized(address indexed agent, bool authorized);
    event TokenPriceUpdated(uint256 chainId, address token, uint256 price);

    // Modifiers
    modifier onlyAuthorizedAgent() {
        require(authorizedAgents[msg.sender], "Not authorized agent");
        _;
    }

    modifier validAction(bytes32 actionId) {
        require(rebalanceActions[actionId].user != address(0), "Invalid action");
        require(!rebalanceActions[actionId].executed, "Action already executed");
        _;
    }

    constructor(address _portfolioManager) {
        portfolioManager = PortfolioManager(_portfolioManager);
    }

    /**
     * @dev Authorize or deauthorize an agent
     * @param agent The agent address
     * @param authorized Whether the agent is authorized
     */
    function setAuthorizedAgent(address agent, bool authorized) external onlyOwner {
        authorizedAgents[agent] = authorized;
        emit AgentAuthorized(agent, authorized);
    }

    /**
     * @dev Update token price for a specific chain
     * @param chainId The chain ID
     * @param token The token address
     * @param price The price in USD (scaled by 1e18)
     */
    function updateTokenPrice(uint256 chainId, address token, uint256 price) external onlyOwner {
        chainTokenPrices[chainId][token] = price;
        emit TokenPriceUpdated(chainId, token, price);
    }

    /**
     * @dev Create a rebalancing action
     * @param user The user address
     * @param swaps Array of swap parameters
     * @param bridges Array of bridge parameters
     * @param totalValue Total portfolio value in USD (scaled by 1e18)
     * @return actionId The unique action identifier
     */
    function createRebalanceAction(
        address user,
        SwapParams[] memory swaps,
        BridgeParams[] memory bridges,
        uint256 totalValue
    ) external onlyAuthorizedAgent returns (bytes32) {
        require(user != address(0), "Invalid user");
        require(totalValue > 0, "Invalid total value");

        bytes32 actionId = keccak256(abi.encodePacked(
            user,
            block.timestamp,
            block.number,
            swaps.length,
            bridges.length
        ));

        rebalanceActions[actionId] = RebalanceAction({
            user: user,
            swaps: swaps,
            bridges: bridges,
            totalValue: totalValue,
            timestamp: block.timestamp,
            executed: false
        });

        emit RebalanceActionCreated(actionId, user, totalValue);
        return actionId;
    }

    /**
     * @dev Execute a swap operation
     * @param actionId The rebalancing action ID
     * @param swapIndex The index of the swap in the action
     * @param actualAmountOut The actual amount received from the swap
     */
    function executeSwap(
        bytes32 actionId,
        uint256 swapIndex,
        uint256 actualAmountOut
    ) external onlyAuthorizedAgent validAction(actionId) {
        RebalanceAction storage action = rebalanceActions[actionId];
        require(swapIndex < action.swaps.length, "Invalid swap index");

        SwapParams memory swap = action.swaps[swapIndex];
        require(actualAmountOut >= swap.minAmountOut, "Slippage too high");

        // Update user balance in PortfolioManager
        portfolioManager.updateBalance(action.user, swap.tokenIn, 0);
        portfolioManager.updateBalance(action.user, swap.tokenOut, actualAmountOut);

        emit SwapExecuted(actionId, swap.tokenIn, swap.tokenOut, swap.amountIn, actualAmountOut, swap.chainId);
    }

    /**
     * @dev Execute a bridge operation
     * @param actionId The rebalancing action ID
     * @param bridgeIndex The index of the bridge in the action
     * @param actualAmount The actual amount bridged
     */
    function executeBridge(
        bytes32 actionId,
        uint256 bridgeIndex,
        uint256 actualAmount
    ) external onlyAuthorizedAgent validAction(actionId) {
        RebalanceAction storage action = rebalanceActions[actionId];
        require(bridgeIndex < action.bridges.length, "Invalid bridge index");

        BridgeParams memory bridge = action.bridges[bridgeIndex];
        require(actualAmount > 0, "Invalid bridge amount");

        // Update user balance in PortfolioManager
        portfolioManager.updateBalance(action.user, bridge.token, actualAmount);

        emit BridgeExecuted(actionId, bridge.token, actualAmount, bridge.fromChainId, bridge.toChainId);
    }

    /**
     * @dev Complete a rebalancing action
     * @param actionId The rebalancing action ID
     */
    function completeRebalanceAction(bytes32 actionId) external onlyAuthorizedAgent validAction(actionId) {
        RebalanceAction storage action = rebalanceActions[actionId];
        
        // Mark action as executed
        action.executed = true;
        
        // Notify PortfolioManager of completed rebalancing
        portfolioManager.executeRebalance(action.user, action.totalValue);

        emit RebalanceActionExecuted(actionId, action.user);
    }

    /**
     * @dev Calculate portfolio drift
     * @param user The user address
     * @param currentBalances Current token balances
     * @return driftPercentages Array of drift percentages (basis points)
     */
    function calculateDrift(
        address user,
        address[] memory tokens,
        uint256[] memory currentBalances
    ) external view returns (uint256[] memory driftPercentages) {
        PortfolioManager.Portfolio memory portfolio = portfolioManager.getPortfolio(user);
        require(tokens.length == currentBalances.length, "Invalid input length");
        require(tokens.length == portfolio.assets.length, "Invalid portfolio length");

        driftPercentages = new uint256[](tokens.length);
        
        // Calculate total portfolio value
        uint256 totalValue = 0;
        for (uint256 i = 0; i < tokens.length; i++) {
            uint256 price = chainTokenPrices[portfolio.assets[i].chainId][tokens[i]];
            totalValue += (currentBalances[i] * price) / 1e18;
        }

        // Calculate drift for each asset
        for (uint256 i = 0; i < tokens.length; i++) {
            uint256 currentValue = (currentBalances[i] * chainTokenPrices[portfolio.assets[i].chainId][tokens[i]]) / 1e18;
            uint256 currentPercentage = totalValue > 0 ? (currentValue * 10000) / totalValue : 0;
            
            uint256 targetPercentage = portfolio.assets[i].targetPercentage;
            driftPercentages[i] = currentPercentage > targetPercentage
                ? currentPercentage - targetPercentage
                : targetPercentage - currentPercentage;
        }
    }

    /**
     * @dev Get rebalancing action details
     * @param actionId The action ID
     * @return RebalanceAction struct
     */
    function getRebalanceAction(bytes32 actionId) external view returns (RebalanceAction memory) {
        return rebalanceActions[actionId];
    }

    /**
     * @dev Get token price for a specific chain
     * @param chainId The chain ID
     * @param token The token address
     * @return price The price in USD (scaled by 1e18)
     */
    function getTokenPrice(uint256 chainId, address token) external view returns (uint256) {
        return chainTokenPrices[chainId][token];
    }

    /**
     * @dev Emergency function to pause rebalancing
     * @param actionId The action ID to pause
     */
    function emergencyPause(bytes32 actionId) external onlyOwner {
        RebalanceAction storage action = rebalanceActions[actionId];
        require(action.user != address(0), "Invalid action");
        action.executed = true; // Mark as executed to prevent further operations
    }
}
