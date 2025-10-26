/**
 * IgnisX Automation Agent
 * 
 * This service monitors user portfolios for drift from target allocations
 * and automatically triggers rebalancing when thresholds are exceeded.
 * It integrates with Avail Nexus SDK for cross-chain operations and
 * Lit Protocol Vincent for delegated signing.
 */

import { availNexusService, CrossChainRoute, SwapRoute, BridgeRoute } from './availNexusService';
import { litProtocolService, DelegationSession, SignedOperation } from './litProtocolService';

export interface PortfolioState {
  user: string;
  assets: Array<{
    tokenAddress: string;
    chainId: number;
    targetPercentage: number;
    currentBalance: string;
    currentValue: number;
  }>;
  totalValue: number;
  lastRebalance: number;
  needsRebalancing: boolean;
}

export interface RebalancingPlan {
  user: string;
  totalValue: number;
  swaps: SwapRoute[];
  bridges: BridgeRoute[];
  estimatedGas: string;
  estimatedTime: number;
  priceImpact: number;
}

export interface MonitoringConfig {
  checkInterval: number; // milliseconds
  driftThreshold: number; // basis points
  maxRebalanceAmount: number; // USD
  cooldownPeriod: number; // seconds
}

export class IgnisXAutomationAgent {
  private monitoringConfig: MonitoringConfig;
  private activeSessions: Map<string, DelegationSession> = new Map();
  private portfolioStates: Map<string, PortfolioState> = new Map();
  private isMonitoring = false;
  private monitoringInterval?: NodeJS.Timeout;

  constructor(config: MonitoringConfig) {
    this.monitoringConfig = config;
  }

  /**
   * Start monitoring user portfolios
   */
  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      console.log("Monitoring already active");
      return;
    }

    console.log("Starting IgnisX automation agent...");
    this.isMonitoring = true;

    // Start monitoring loop
    this.monitoringInterval = setInterval(async () => {
      await this.checkAllPortfolios();
    }, this.monitoringConfig.checkInterval);

    console.log("Automation agent started successfully");
  }

  /**
   * Stop monitoring
   */
  async stopMonitoring(): Promise<void> {
    if (!this.isMonitoring) {
      return;
    }

    console.log("Stopping IgnisX automation agent...");
    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }

    console.log("Automation agent stopped");
  }

  /**
   * Register a user for automated rebalancing
   */
  async registerUser(
    userAddress: string,
    session: DelegationSession
  ): Promise<void> {
    this.activeSessions.set(userAddress, session);
    console.log(`Registered user ${userAddress} for automated rebalancing`);
  }

  /**
   * Unregister a user from automated rebalancing
   */
  async unregisterUser(userAddress: string): Promise<void> {
    this.activeSessions.delete(userAddress);
    this.portfolioStates.delete(userAddress);
    console.log(`Unregistered user ${userAddress} from automated rebalancing`);
  }

  /**
   * Check all registered portfolios for drift
   */
  private async checkAllPortfolios(): Promise<void> {
    const users = Array.from(this.activeSessions.keys());
    
    for (const user of users) {
      try {
        await this.checkPortfolio(user);
      } catch (error) {
        console.error(`Error checking portfolio for user ${user}:`, error);
      }
    }
  }

  /**
   * Check a specific user's portfolio
   */
  private async checkPortfolio(userAddress: string): Promise<void> {
    const session = this.activeSessions.get(userAddress);
    if (!session || !session.isActive) {
      return;
    }

    // Check if session is still valid
    if (Date.now() > session.expiry * 1000) {
      console.log(`Session expired for user ${userAddress}`);
      await this.unregisterUser(userAddress);
      return;
    }

    // Get current portfolio state
    const portfolioState = await this.getPortfolioState(userAddress);
    if (!portfolioState) {
      return;
    }

    // Check if rebalancing is needed
    if (portfolioState.needsRebalancing) {
      console.log(`Portfolio drift detected for user ${userAddress}`);
      await this.triggerRebalancing(userAddress, portfolioState, session);
    }

    // Update portfolio state
    this.portfolioStates.set(userAddress, portfolioState);
  }

  /**
   * Get current portfolio state for a user
   */
  private async getPortfolioState(userAddress: string): Promise<PortfolioState | null> {
    try {
      // Mock portfolio data - in reality this would fetch from contracts
      const mockAssets = [
        {
          tokenAddress: "0xA0b86a33E6441c8C0C8C0C8C0C8C0C8C0C8C0C8C",
          chainId: 1,
          targetPercentage: 5000, // 50%
          currentBalance: "1000",
          currentValue: 1000
        },
        {
          tokenAddress: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
          chainId: 1,
          targetPercentage: 5000, // 50%
          currentBalance: "500",
          currentValue: 500
        }
      ];

      const totalValue = mockAssets.reduce((sum, asset) => sum + asset.currentValue, 0);
      
      // Calculate drift
      const driftData = await availNexusService.calculatePortfolioDrift(
        mockAssets.map(asset => ({
          tokenAddress: asset.tokenAddress,
          chainId: asset.chainId,
          targetPercentage: asset.targetPercentage,
          currentBalance: asset.currentBalance
        }))
      );

      const maxDrift = Math.max(...driftData.map(d => d.drift));
      const needsRebalancing = maxDrift > this.monitoringConfig.driftThreshold;

      return {
        user: userAddress,
        assets: mockAssets,
        totalValue,
        lastRebalance: Date.now() - 3600000, // 1 hour ago
        needsRebalancing
      };
    } catch (error) {
      console.error(`Error getting portfolio state for ${userAddress}:`, error);
      return null;
    }
  }

  /**
   * Trigger rebalancing for a user
   */
  private async triggerRebalancing(
    userAddress: string,
    portfolioState: PortfolioState,
    session: DelegationSession
  ): Promise<void> {
    try {
      console.log(`Triggering rebalancing for user ${userAddress}`);

      // Check cooldown period
      const timeSinceLastRebalance = Date.now() - portfolioState.lastRebalance;
      if (timeSinceLastRebalance < this.monitoringConfig.cooldownPeriod * 1000) {
        console.log(`Cooldown period not met for user ${userAddress}`);
        return;
      }

      // Create rebalancing plan
      const plan = await this.createRebalancingPlan(portfolioState);
      if (!plan) {
        console.log(`No rebalancing plan created for user ${userAddress}`);
        return;
      }

      // Check if plan exceeds max rebalance amount
      if (plan.totalValue > this.monitoringConfig.maxRebalanceAmount) {
        console.log(`Rebalancing plan exceeds max amount for user ${userAddress}`);
        return;
      }

      // Execute rebalancing
      await this.executeRebalancing(userAddress, plan, session);

    } catch (error) {
      console.error(`Error triggering rebalancing for ${userAddress}:`, error);
    }
  }

  /**
   * Create a rebalancing plan
   */
  private async createRebalancingPlan(portfolioState: PortfolioState): Promise<RebalancingPlan | null> {
    try {
      const swaps: SwapRoute[] = [];
      const bridges: BridgeRoute[] = [];
      let totalGas = 0;
      let totalTime = 0;
      let totalPriceImpact = 0;

      // Analyze each asset and determine rebalancing actions
      for (const asset of portfolioState.assets) {
        const targetValue = (portfolioState.totalValue * asset.targetPercentage) / 10000;
        const currentValue = asset.currentValue;
        const drift = Math.abs(targetValue - currentValue);

        // Only rebalance if drift is significant
        if (drift > portfolioState.totalValue * 0.01) { // 1% threshold
          // Determine if we need to swap or bridge
          if (asset.currentValue > targetValue) {
            // Asset is overweight - need to sell/bridge out
            const excessAmount = (asset.currentValue - targetValue).toString();
            
            // Find optimal route to rebalance
            const route = await availNexusService.findCrossChainRoute(
              asset.tokenAddress,
              asset.tokenAddress, // Same token for now
              excessAmount,
              asset.chainId,
              asset.chainId,
              50 // 0.5% slippage
            );

            if (route) {
              swaps.push(...route.swaps);
              bridges.push(...route.bridges);
              totalGas += parseInt(route.totalGasEstimate);
              totalTime = Math.max(totalTime, route.totalTimeEstimate);
              totalPriceImpact += route.priceImpact;
            }
          }
        }
      }

      if (swaps.length === 0 && bridges.length === 0) {
        return null;
      }

      return {
        user: portfolioState.user,
        totalValue: portfolioState.totalValue,
        swaps,
        bridges,
        estimatedGas: totalGas.toString(),
        estimatedTime: totalTime,
        priceImpact: totalPriceImpact
      };
    } catch (error) {
      console.error("Error creating rebalancing plan:", error);
      return null;
    }
  }

  /**
   * Execute rebalancing using Lit Protocol delegation
   */
  private async executeRebalancing(
    userAddress: string,
    plan: RebalancingPlan,
    session: DelegationSession
  ): Promise<void> {
    try {
      console.log(`Executing rebalancing for user ${userAddress}`);

      // Create signed operations for each swap and bridge
      const operations: SignedOperation[] = [];

      // Sign swap operations
      for (const swap of plan.swaps) {
        const operationData = JSON.stringify({
          routeId: swap.routeId,
          tokenIn: swap.tokenIn.address,
          tokenOut: swap.tokenOut.address,
          amountIn: swap.amountIn,
          amountOut: swap.amountOut,
          chainId: swap.tokenIn.chainId
        });

        const signedOp = await litProtocolService.signOperation(
          session,
          1, // Swap operation type
          operationData
        );
        operations.push(signedOp);
      }

      // Sign bridge operations
      for (const bridge of plan.bridges) {
        const operationData = JSON.stringify({
          bridgeId: bridge.bridgeId,
          token: bridge.token.address,
          amount: bridge.amount,
          fromChainId: bridge.fromChainId,
          toChainId: bridge.toChainId
        });

        const signedOp = await litProtocolService.signOperation(
          session,
          2, // Bridge operation type
          operationData
        );
        operations.push(signedOp);
      }

      // Execute operations
      for (const operation of operations) {
        await this.executeOperation(operation, session);
      }

      console.log(`Rebalancing completed for user ${userAddress}`);

    } catch (error) {
      console.error(`Error executing rebalancing for ${userAddress}:`, error);
    }
  }

  /**
   * Execute a single operation
   */
  private async executeOperation(
    operation: SignedOperation,
    session: DelegationSession
  ): Promise<void> {
    try {
      // Verify the operation signature
      const isValid = await litProtocolService.verifySignedOperation(operation, session);
      if (!isValid) {
        throw new Error("Invalid operation signature");
      }

      // Parse operation data
      const operationData = JSON.parse(operation.data);

      if (operation.operationType === 1) {
        // Execute swap
        const swapRoute: SwapRoute = {
          routeId: operationData.routeId,
          tokenIn: { address: operationData.tokenIn, symbol: "", name: "", decimals: 18, chainId: operationData.chainId },
          tokenOut: { address: operationData.tokenOut, symbol: "", name: "", decimals: 18, chainId: operationData.chainId },
          amountIn: operationData.amountIn,
          amountOut: operationData.amountOut,
          priceImpact: 0.1,
          gasEstimate: "50000",
          steps: []
        };

        await availNexusService.executeSwap(swapRoute, operation.user);
      } else if (operation.operationType === 2) {
        // Execute bridge
        const bridgeRoute: BridgeRoute = {
          bridgeId: operationData.bridgeId,
          token: { address: operationData.token, symbol: "", name: "", decimals: 18, chainId: operationData.fromChainId },
          amount: operationData.amount,
          fromChainId: operationData.fromChainId,
          toChainId: operationData.toChainId,
          estimatedTime: 300,
          fee: "0.001",
          bridgeProtocol: "Avail Bridge"
        };

        await availNexusService.executeBridge(bridgeRoute, operation.user);
      }

      console.log(`Operation executed successfully: ${operation.operationType}`);

    } catch (error) {
      console.error("Error executing operation:", error);
      throw error;
    }
  }

  /**
   * Get monitoring statistics
   */
  getMonitoringStats(): {
    activeUsers: number;
    totalPortfolios: number;
    rebalancingEvents: number;
    isMonitoring: boolean;
  } {
    return {
      activeUsers: this.activeSessions.size,
      totalPortfolios: this.portfolioStates.size,
      rebalancingEvents: 0, // Would track this in production
      isMonitoring: this.isMonitoring
    };
  }

  /**
   * Update monitoring configuration
   */
  updateMonitoringConfig(config: Partial<MonitoringConfig>): void {
    this.monitoringConfig = { ...this.monitoringConfig, ...config };
    console.log("Monitoring configuration updated:", this.monitoringConfig);
  }
}

// Export singleton instance
export const automationAgent = new IgnisXAutomationAgent({
  checkInterval: 60000, // 1 minute
  driftThreshold: 100, // 1%
  maxRebalanceAmount: 10000, // $10,000
  cooldownPeriod: 3600 // 1 hour
});
