# IgnisX - Trustless On-Chain Multi-Chain Portfolio Autopilot

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20.18.3
- Yarn >= 3.2.3
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/ignisx.git
   cd ignisx
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Alchemy API Key (for RPC endpoints)
   ALCHEMY_API_KEY=your_alchemy_api_key
   
   # Deployer Private Key (for contract deployment)
   __RUNTIME_DEPLOYER_PRIVATE_KEY=your_private_key
   
   # Etherscan API Key (for contract verification)
   ETHERSCAN_V2_API_KEY=your_etherscan_api_key
   
   # Lit Protocol Configuration
   LIT_PROTOCOL_NETWORK=serrano
   LIT_PROTOCOL_RPC_URL=https://lit-protocol-rpc.com
   
   # Avail Nexus Configuration
   AVAIL_NEXUS_API_URL=https://nexus-api.availproject.org
   AVAIL_NEXUS_API_KEY=your_avail_api_key
   ```

### Local Development

1. **Start local blockchain**
   ```bash
   yarn chain
   ```

2. **Deploy contracts**
   ```bash
   yarn deploy
   ```

3. **Start frontend**
   ```bash
   yarn start
   ```

4. **Run tests**
   ```bash
   yarn test
   ```

## 🏗️ Architecture

### Smart Contracts

IgnisX consists of four main smart contracts:

#### 1. PortfolioManager
- **Purpose**: Manages user portfolios and target allocations
- **Key Functions**:
  - `createPortfolio()`: Create a new portfolio with target allocations
  - `updatePortfolio()`: Update existing portfolio allocations
  - `setDelegationPolicy()`: Set delegation policy for autopilot
  - `revokeDelegation()`: Revoke autopilot delegation
  - `needsRebalancing()`: Check if portfolio needs rebalancing

#### 2. CrossChainRebalancer
- **Purpose**: Handles cross-chain rebalancing operations
- **Key Functions**:
  - `createRebalanceAction()`: Create a rebalancing action
  - `executeSwap()`: Execute swap operations
  - `executeBridge()`: Execute bridge operations
  - `calculateDrift()`: Calculate portfolio drift

#### 3. LitProtocolDelegate
- **Purpose**: Manages Lit Protocol Vincent delegation sessions
- **Key Functions**:
  - `createDelegationSession()`: Create delegation session
  - `verifySignedOperation()`: Verify signed operations
  - `executeOperation()`: Execute verified operations
  - `revokeDelegationSession()`: Revoke delegation session

#### 4. IgnisX (Main Contract)
- **Purpose**: Orchestrates the entire system
- **Key Functions**:
  - `enableAutopilot()`: Enable autopilot with Lit Protocol delegation
  - `disableAutopilot()`: Disable autopilot
  - `triggerRebalancing()`: Trigger rebalancing operations
  - `updateTokenPrice()`: Update token prices

### Frontend Components

#### Core Components
- **PortfolioDashboard**: Main dashboard showing portfolio overview
- **AssetManager**: Manage portfolio assets and allocations
- **DelegationManager**: Configure autopilot delegation settings
- **RebalancingHistory**: View rebalancing history and analytics

#### Services
- **availNexusService**: Cross-chain swap and bridge operations
- **litProtocolService**: Lit Protocol Vincent integration
- **automationAgent**: Portfolio monitoring and rebalancing automation

## 🔧 Configuration

### Supported Networks

IgnisX supports the following networks:

| Network | Chain ID | RPC URL | Explorer |
|---------|----------|---------|----------|
| Ethereum | 1 | https://mainnet.infura.io/v3/YOUR_KEY | https://etherscan.io |
| Polygon | 137 | https://polygon-rpc.com | https://polygonscan.com |
| Arbitrum | 42161 | https://arb1.arbitrum.io/rpc | https://arbiscan.io |
| Optimism | 10 | https://mainnet.optimism.io | https://optimistic.etherscan.io |
| Base | 8453 | https://mainnet.base.org | https://basescan.org |

### Supported Tokens

Default supported tokens include:
- **USDC**: USD Coin (6 decimals)
- **DAI**: Dai Stablecoin (18 decimals)
- **WBTC**: Wrapped Bitcoin (8 decimals)
- **ETH**: Native Ether (18 decimals)

## 🚀 Deployment

### Testnet Deployment

1. **Deploy to Sepolia**
   ```bash
   yarn deploy --network sepolia
   ```

2. **Verify contracts**
   ```bash
   yarn verify --network sepolia
   ```

### Mainnet Deployment

1. **Deploy to Ethereum Mainnet**
   ```bash
   yarn deploy --network mainnet
   ```

2. **Verify contracts**
   ```bash
   yarn verify --network mainnet
   ```

3. **Deploy to other networks**
   ```bash
   # Polygon
   yarn deploy --network polygon
   
   # Arbitrum
   yarn deploy --network arbitrum
   
   # Optimism
   yarn deploy --network optimism
   
   # Base
   yarn deploy --network base
   ```

### Contract Addresses

After deployment, update the contract addresses in:
- `packages/nextjs/contracts/deployedContracts.ts`
- `packages/nextjs/scaffold.config.ts`

## 🔐 Security

### Delegation Model

IgnisX uses Lit Protocol Vincent for secure, policy-limited delegation:

1. **Policy-Limited**: Delegation is restricted by user-defined policies
2. **Time-Bound**: Sessions have automatic expiry
3. **Revocable**: Users can revoke delegation at any time
4. **Transparent**: All operations are on-chain and auditable

### Security Features

- **No Custody Risk**: Users retain full control of their assets
- **On-Chain Policies**: All delegation policies are enforced on-chain
- **Multi-Signature**: Critical operations require multiple signatures
- **Emergency Pause**: Contracts can be paused in emergency situations

## 📊 Monitoring

### Portfolio Monitoring

The automation agent monitors portfolios for:
- **Drift Detection**: Monitors allocation drift from targets
- **Threshold Breaches**: Triggers rebalancing when drift exceeds threshold
- **Cooldown Periods**: Enforces minimum time between rebalancing
- **Gas Optimization**: Optimizes gas usage for operations

### Metrics Tracked

- Portfolio value and allocation percentages
- Rebalancing frequency and success rate
- Gas costs and transaction fees
- Cross-chain operation performance
- Delegation session usage

## 🧪 Testing

### Running Tests

```bash
# Run all tests
yarn test

# Run specific test file
yarn test test/IgnisX.test.ts

# Run with gas reporting
REPORT_GAS=true yarn test

# Run with coverage
yarn coverage
```

### Test Coverage

Tests cover:
- ✅ Portfolio creation and management
- ✅ Delegation policy setting and revocation
- ✅ Cross-chain rebalancing operations
- ✅ Lit Protocol delegation sessions
- ✅ Integration between all contracts
- ✅ Error handling and edge cases

## 🔧 Development

### Adding New Features

1. **Smart Contracts**
   - Add new functions to existing contracts
   - Create new contracts if needed
   - Update tests and documentation

2. **Frontend**
   - Add new components in `packages/nextjs/components/ignisx/`
   - Update services in `packages/nextjs/services/`
   - Add new pages in `packages/nextjs/app/`

3. **Integration**
   - Update Avail Nexus SDK integration
   - Enhance Lit Protocol Vincent integration
   - Improve automation agent logic

### Code Style

- **Solidity**: Follow OpenZeppelin standards
- **TypeScript**: Use strict typing and ESLint rules
- **React**: Use functional components with hooks
- **Testing**: Maintain >90% test coverage

## 📚 API Reference

### Smart Contract Functions

#### PortfolioManager
```solidity
function createPortfolio(address user, Asset[] memory assets) external
function updatePortfolio(address user, Asset[] memory assets) external
function setDelegationPolicy(address user, address delegate, uint256 maxSlippage, uint256 maxRebalanceAmount, uint256 rebalanceThreshold, uint256 cooldownPeriod) external
function revokeDelegation(address user) external
function needsRebalancing(address user, uint256[] memory currentAllocations) external view returns (bool)
```

#### CrossChainRebalancer
```solidity
function createRebalanceAction(address user, SwapParams[] memory swaps, BridgeParams[] memory bridges, uint256 totalValue) external returns (bytes32)
function executeSwap(bytes32 actionId, uint256 swapIndex, uint256 actualAmountOut) external
function executeBridge(bytes32 actionId, uint256 bridgeIndex, uint256 actualAmount) external
function calculateDrift(address user, address[] memory tokens, uint256[] memory currentBalances) external view returns (uint256[] memory)
```

#### LitProtocolDelegate
```solidity
function createDelegationSession(address user, address delegate, uint256 expiry, bytes32 policyHash, uint256 maxOperations) external returns (bytes32)
function verifySignedOperation(bytes32 sessionId, SignedOperation memory operation) external returns (bool)
function executeOperation(bytes32 sessionId, SignedOperation memory operation, bytes32 operationHash) external
function revokeDelegationSession(bytes32 sessionId) external
```

### Frontend Services

#### AvailNexusService
```typescript
async findSwapRoute(tokenIn: string, tokenOut: string, amountIn: string, chainId: number): Promise<SwapRoute | null>
async findBridgeRoute(token: string, amount: string, fromChainId: number, toChainId: number): Promise<BridgeRoute | null>
async findCrossChainRoute(tokenIn: string, tokenOut: string, amountIn: string, fromChainId: number, toChainId: number): Promise<CrossChainRoute | null>
async executeSwap(route: SwapRoute, userAddress: string): Promise<{ txHash: string; success: boolean }>
async executeBridge(route: BridgeRoute, userAddress: string): Promise<{ txHash: string; success: boolean }>
```

#### LitProtocolService
```typescript
async createDelegationSession(userAddress: string, delegateAddress: string, policy: DelegationPolicy, sessionExpiry: number, maxOperations: number): Promise<DelegationSession>
async signOperation(session: DelegationSession, operationType: number, operationData: string): Promise<SignedOperation>
async verifySignedOperation(operation: SignedOperation, session: DelegationSession): Promise<boolean>
async revokeDelegationSession(sessionId: string): Promise<boolean>
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation
- Ensure all tests pass
- Maintain test coverage above 90%

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Scaffold-ETH 2](https://github.com/scaffold-eth/scaffold-eth-2) - Development framework
- [Avail Project](https://availproject.org/) - Cross-chain infrastructure
- [Lit Protocol](https://litprotocol.com/) - Decentralized signing
- [OpenZeppelin](https://openzeppelin.com/) - Smart contract libraries

## 📞 Support

- **Documentation**: [docs.ignisx.com](https://docs.ignisx.com)
- **Discord**: [discord.gg/ignisx](https://discord.gg/ignisx)
- **Twitter**: [@IgnisXApp](https://twitter.com/IgnisXApp)
- **Email**: support@ignisx.com

---

**Built with ❤️ by the IgnisX Team**
