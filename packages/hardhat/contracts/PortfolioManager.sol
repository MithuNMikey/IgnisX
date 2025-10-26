//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title PortfolioManager
 * @dev Manages user portfolios, target allocations, and delegation policies
 * @author IgnisX Team
 */
contract PortfolioManager is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Structs
    struct Asset {
        address tokenAddress;
        uint256 chainId;
        uint256 targetPercentage; // Basis points (10000 = 100%)
        bool isActive;
    }

    struct Portfolio {
        Asset[] assets;
        uint256 totalValue; // Total portfolio value in USD (scaled by 1e18)
        uint256 lastRebalance;
        bool isActive;
    }

    struct DelegationPolicy {
        address delegate; // The autopilot agent address
        uint256 maxSlippage; // Max slippage allowed (basis points)
        uint256 maxRebalanceAmount; // Max amount per rebalance (in USD, scaled by 1e18)
        uint256 rebalanceThreshold; // Threshold to trigger rebalancing (basis points)
        uint256 cooldownPeriod; // Minimum time between rebalances (seconds)
        bool isActive;
    }

    // State variables
    mapping(address => Portfolio) public portfolios;
    mapping(address => DelegationPolicy) public delegationPolicies;
    mapping(address => mapping(address => uint256)) public userBalances; // user => token => balance
    
    // Events
    event PortfolioCreated(address indexed user, Asset[] assets);
    event PortfolioUpdated(address indexed user, Asset[] assets);
    event AssetAdded(address indexed user, address tokenAddress, uint256 chainId, uint256 targetPercentage);
    event AssetRemoved(address indexed user, address tokenAddress, uint256 chainId);
    event DelegationPolicySet(address indexed user, address delegate, uint256 maxSlippage, uint256 maxRebalanceAmount, uint256 rebalanceThreshold, uint256 cooldownPeriod);
    event DelegationRevoked(address indexed user);
    event RebalanceExecuted(address indexed user, address indexed delegate, uint256 totalValue, uint256 timestamp);
    event BalanceUpdated(address indexed user, address tokenAddress, uint256 newBalance);

    // Modifiers
    modifier onlyPortfolioOwner(address user) {
        require(msg.sender == user || msg.sender == owner(), "Not portfolio owner");
        _;
    }

    modifier validPercentage(uint256 percentage) {
        require(percentage <= 10000, "Invalid percentage");
        _;
    }

    modifier portfolioExists(address user) {
        require(portfolios[user].isActive, "Portfolio does not exist");
        _;
    }

    /**
     * @dev Create a new portfolio for a user
     * @param user The user address
     * @param assets Array of assets with their target allocations
     */
    function createPortfolio(address user, Asset[] memory assets) external onlyPortfolioOwner(user) {
        require(!portfolios[user].isActive, "Portfolio already exists");
        require(assets.length > 0, "Portfolio must have at least one asset");
        
        uint256 totalPercentage = 0;
        for (uint256 i = 0; i < assets.length; i++) {
            require(assets[i].tokenAddress != address(0), "Invalid token address");
            require(assets[i].targetPercentage > 0, "Target percentage must be > 0");
            totalPercentage += assets[i].targetPercentage;
        }
        require(totalPercentage == 10000, "Total percentage must equal 100%");

        portfolios[user] = Portfolio({
            assets: assets,
            totalValue: 0,
            lastRebalance: 0,
            isActive: true
        });

        emit PortfolioCreated(user, assets);
    }

    /**
     * @dev Update an existing portfolio
     * @param user The user address
     * @param assets New array of assets with their target allocations
     */
    function updatePortfolio(address user, Asset[] memory assets) external onlyPortfolioOwner(user) portfolioExists(user) {
        require(assets.length > 0, "Portfolio must have at least one asset");
        
        uint256 totalPercentage = 0;
        for (uint256 i = 0; i < assets.length; i++) {
            require(assets[i].tokenAddress != address(0), "Invalid token address");
            require(assets[i].targetPercentage > 0, "Target percentage must be > 0");
            totalPercentage += assets[i].targetPercentage;
        }
        require(totalPercentage == 10000, "Total percentage must equal 100%");

        portfolios[user].assets = assets;
        emit PortfolioUpdated(user, assets);
    }

    /**
     * @dev Add a new asset to an existing portfolio
     * @param user The user address
     * @param tokenAddress The token contract address
     * @param chainId The chain ID where this token exists
     * @param targetPercentage Target allocation percentage (basis points)
     */
    function addAsset(address user, address tokenAddress, uint256 chainId, uint256 targetPercentage) 
        external 
        onlyPortfolioOwner(user) 
        portfolioExists(user)
        validPercentage(targetPercentage) 
    {
        Portfolio storage portfolio = portfolios[user];
        
        // Check if asset already exists
        for (uint256 i = 0; i < portfolio.assets.length; i++) {
            require(
                portfolio.assets[i].tokenAddress != tokenAddress || portfolio.assets[i].chainId != chainId,
                "Asset already exists"
            );
        }

        portfolio.assets.push(Asset({
            tokenAddress: tokenAddress,
            chainId: chainId,
            targetPercentage: targetPercentage,
            isActive: true
        }));

        emit AssetAdded(user, tokenAddress, chainId, targetPercentage);
    }

    /**
     * @dev Remove an asset from a portfolio
     * @param user The user address
     * @param tokenAddress The token contract address
     * @param chainId The chain ID where this token exists
     */
    function removeAsset(address user, address tokenAddress, uint256 chainId) 
        external 
        onlyPortfolioOwner(user) 
        portfolioExists(user) 
    {
        Portfolio storage portfolio = portfolios[user];
        
        for (uint256 i = 0; i < portfolio.assets.length; i++) {
            if (portfolio.assets[i].tokenAddress == tokenAddress && portfolio.assets[i].chainId == chainId) {
                portfolio.assets[i] = portfolio.assets[portfolio.assets.length - 1];
                portfolio.assets.pop();
                emit AssetRemoved(user, tokenAddress, chainId);
                return;
            }
        }
        revert("Asset not found");
    }

    /**
     * @dev Set delegation policy for automated rebalancing
     * @param user The user address
     * @param delegate The autopilot agent address
     * @param maxSlippage Maximum slippage allowed (basis points)
     * @param maxRebalanceAmount Maximum amount per rebalance (USD, scaled by 1e18)
     * @param rebalanceThreshold Threshold to trigger rebalancing (basis points)
     * @param cooldownPeriod Minimum time between rebalances (seconds)
     */
    function setDelegationPolicy(
        address user,
        address delegate,
        uint256 maxSlippage,
        uint256 maxRebalanceAmount,
        uint256 rebalanceThreshold,
        uint256 cooldownPeriod
    ) external onlyPortfolioOwner(user) portfolioExists(user) {
        require(delegate != address(0), "Invalid delegate address");
        require(maxSlippage <= 1000, "Max slippage too high"); // Max 10%
        require(rebalanceThreshold <= 1000, "Rebalance threshold too high"); // Max 10%
        require(cooldownPeriod >= 3600, "Cooldown period too short"); // Min 1 hour

        delegationPolicies[user] = DelegationPolicy({
            delegate: delegate,
            maxSlippage: maxSlippage,
            maxRebalanceAmount: maxRebalanceAmount,
            rebalanceThreshold: rebalanceThreshold,
            cooldownPeriod: cooldownPeriod,
            isActive: true
        });

        emit DelegationPolicySet(user, delegate, maxSlippage, maxRebalanceAmount, rebalanceThreshold, cooldownPeriod);
    }

    /**
     * @dev Revoke delegation policy
     * @param user The user address
     */
    function revokeDelegation(address user) external onlyPortfolioOwner(user) {
        delegationPolicies[user].isActive = false;
        emit DelegationRevoked(user);
    }

    /**
     * @dev Update user's token balance (called by autopilot agent)
     * @param user The user address
     * @param tokenAddress The token contract address
     * @param newBalance The new balance
     */
    function updateBalance(address user, address tokenAddress, uint256 newBalance) external {
        require(delegationPolicies[user].isActive, "Delegation not active");
        require(msg.sender == delegationPolicies[user].delegate, "Not authorized delegate");
        
        userBalances[user][tokenAddress] = newBalance;
        emit BalanceUpdated(user, tokenAddress, newBalance);
    }

    /**
     * @dev Execute rebalancing (called by autopilot agent)
     * @param user The user address
     * @param totalValue The total portfolio value in USD (scaled by 1e18)
     */
    function executeRebalance(address user, uint256 totalValue) external {
        require(delegationPolicies[user].isActive, "Delegation not active");
        require(msg.sender == delegationPolicies[user].delegate, "Not authorized delegate");
        
        DelegationPolicy memory policy = delegationPolicies[user];
        require(block.timestamp >= portfolios[user].lastRebalance + policy.cooldownPeriod, "Cooldown period not met");
        
        portfolios[user].totalValue = totalValue;
        portfolios[user].lastRebalance = block.timestamp;
        
        emit RebalanceExecuted(user, msg.sender, totalValue, block.timestamp);
    }

    /**
     * @dev Get portfolio information
     * @param user The user address
     * @return Portfolio struct
     */
    function getPortfolio(address user) external view returns (Portfolio memory) {
        return portfolios[user];
    }

    /**
     * @dev Get delegation policy
     * @param user The user address
     * @return DelegationPolicy struct
     */
    function getDelegationPolicy(address user) external view returns (DelegationPolicy memory) {
        return delegationPolicies[user];
    }

    /**
     * @dev Get user's token balance
     * @param user The user address
     * @param tokenAddress The token contract address
     * @return Balance amount
     */
    function getBalance(address user, address tokenAddress) external view returns (uint256) {
        return userBalances[user][tokenAddress];
    }

    /**
     * @dev Check if rebalancing is needed
     * @param user The user address
     * @param currentAllocations Current allocation percentages (basis points)
     * @return bool True if rebalancing is needed
     */
    function needsRebalancing(address user, uint256[] memory currentAllocations) external view returns (bool) {
        if (!delegationPolicies[user].isActive) return false;
        if (block.timestamp < portfolios[user].lastRebalance + delegationPolicies[user].cooldownPeriod) return false;
        
        Portfolio memory portfolio = portfolios[user];
        require(currentAllocations.length == portfolio.assets.length, "Invalid allocation length");
        
        uint256 threshold = delegationPolicies[user].rebalanceThreshold;
        
        for (uint256 i = 0; i < portfolio.assets.length; i++) {
            uint256 drift = currentAllocations[i] > portfolio.assets[i].targetPercentage
                ? currentAllocations[i] - portfolio.assets[i].targetPercentage
                : portfolio.assets[i].targetPercentage - currentAllocations[i];
            
            if (drift > threshold) return true;
        }
        
        return false;
    }
}
