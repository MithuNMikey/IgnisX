
# IgnisX 🔥

**IgnisX** is a trustless, on-chain autopilot for multi-chain crypto portfolios.  
It enables users to set target allocations (e.g., 50% ETH, 50% USDC), and automatically rebalances portfolios across chains using Avail Nexus SDK for cross-chain swaps/bridges.  
Lit Protocol Vincent is used for secure, policy-limited delegated signing, ensuring users never lose custody of their assets.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Solidity](https://img.shields.io/badge/Solidity-363636?logo=solidity&logoColor=white)](https://soliditylang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)

---

## 🚀 Features

- **🎯 Multi-Chain Portfolio Management**  
  Set and update target allocations for assets across multiple EVM-compatible chains.

- **🤖 Automated Rebalancing**  
  IgnisX monitors your portfolio and automatically rebalances when allocations drift from targets.

- **🌉 Cross-Chain Swaps & Bridges**  
  Uses Avail Nexus SDK to find optimal routes for swaps and bridging assets between chains.

- **🔐 Trustless Delegation**  
  Integrates Lit Protocol Vincent for secure, policy-limited delegated signing. Users can delegate rebalancing rights to the autopilot agent, with full transparency and revocability.

- **📊 On-Chain Transparency**  
  All actions are executed on-chain and are fully auditable.

- **💻 User-Friendly Interface**  
  Built with Scaffold-ETH 2 (NextJS, RainbowKit, Wagmi, Viem) for a modern, responsive dApp experience.

---

## 🛠️ Tech Stack

- **[Scaffold-ETH 2](https://docs.scaffoldeth.io/)** - NextJS, Hardhat/Foundry, Wagmi, Viem, RainbowKit
- **[Avail Nexus SDK](https://availproject.org/)** - Cross-chain liquidity and routing
- **[Lit Protocol Vincent](https://developer.litprotocol.com/sdk/authentication/session-sigs/intro)** - Delegated, policy-limited signing
- **TypeScript, TailwindCSS, DaisyUI** - Modern frontend stack

---

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

---

## 📦 Project Structure

```
ignisx/
├── packages/
│   ├── hardhat/                    # Smart contracts
│   │   ├── contracts/
│   │   │   ├── IgnisX.sol         # Main orchestrator contract
│   │   │   ├── PortfolioManager.sol # Portfolio management
│   │   │   ├── CrossChainRebalancer.sol # Rebalancing logic
│   │   │   └── LitProtocolDelegate.sol # Lit Protocol integration
│   │   ├── deploy/                # Deployment scripts
│   │   └── test/                  # Contract tests
│   └── nextjs/                    # Frontend application
│       ├── app/                   # Next.js app directory
│       ├── components/
│       │   └── ignisx/           # IgnisX-specific components
│       │       ├── PortfolioDashboard.tsx
│       │       ├── AssetManager.tsx
│       │       ├── DelegationManager.tsx
│       │       └── RebalancingHistory.tsx
│       └── services/              # Integration services
│           ├── availNexusService.ts
│           ├── litProtocolService.ts
│           └── automationAgent.ts
├── scripts/                       # Automation scripts
├── DEPLOYMENT.md                  # Deployment guide
└── README.md
```

---

## 🏗️ Architecture

### Smart Contracts

#### 1. **PortfolioManager**
- Manages user portfolios and target allocations
- Handles delegation policy setting and revocation
- Tracks portfolio drift and rebalancing needs

#### 2. **CrossChainRebalancer**
- Executes cross-chain swap and bridge operations
- Integrates with Avail Nexus SDK for optimal routing
- Manages rebalancing action lifecycle

#### 3. **LitProtocolDelegate**
- Manages Lit Protocol Vincent delegation sessions
- Verifies signed operations and enforces policies
- Handles session creation, validation, and revocation

#### 4. **IgnisX (Main Contract)**
- Orchestrates the entire system
- Coordinates between all components
- Provides unified interface for frontend

### Frontend Components

#### Core Components
- **PortfolioDashboard**: Main dashboard with portfolio overview
- **AssetManager**: Manage assets and target allocations
- **DelegationManager**: Configure autopilot delegation settings
- **RebalancingHistory**: View rebalancing history and analytics

#### Services
- **availNexusService**: Cross-chain swap and bridge operations
- **litProtocolService**: Lit Protocol Vincent integration
- **automationAgent**: Portfolio monitoring and rebalancing automation

---

## 🔗 Integrations

### Avail Nexus SDK

- **Cross-Chain Routing**: Finds optimal routes for swaps and bridges
- **Price Discovery**: Real-time price feeds for portfolio valuation
- **Gas Optimization**: Minimizes transaction costs across chains
- **Supported Chains**: Ethereum, Polygon, Arbitrum, Optimism, Base

### Lit Protocol Vincent

- **Secure Delegation**: Policy-limited signing with cryptographic guarantees
- **Session Management**: Time-bound sessions with automatic expiry
- **Revocable Permissions**: Instant revocation of delegation rights
- **Multi-Signature**: Enhanced security for critical operations

---

## 🔐 Security

### Delegation Model

IgnisX uses Lit Protocol Vincent for secure, policy-limited delegation:

1. **Policy-Limited**: Delegation restricted by user-defined policies
2. **Time-Bound**: Sessions have automatic expiry
3. **Revocable**: Users can revoke delegation at any time
4. **Transparent**: All operations are on-chain and auditable

### Security Features

- **No Custody Risk**: Users retain full control of their assets
- **On-Chain Policies**: All delegation policies enforced on-chain
- **Multi-Signature**: Critical operations require multiple signatures
- **Emergency Pause**: Contracts can be paused in emergency situations

---

## 🚀 Deployment

### Testnet Deployment

```bash
# Deploy to Sepolia
yarn deploy --network sepolia

# Verify contracts
yarn verify --network sepolia
```

### Mainnet Deployment

```bash
# Deploy to Ethereum Mainnet
yarn deploy --network mainnet

# Deploy to other networks
yarn deploy --network polygon
yarn deploy --network arbitrum
yarn deploy --network optimism
yarn deploy --network base
```

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

---

## 🧪 Testing

```bash
# Run all tests
yarn test

# Run with gas reporting
REPORT_GAS=true yarn test

# Run with coverage
yarn coverage
```

Test coverage includes:
- ✅ Portfolio creation and management
- ✅ Delegation policy setting and revocation
- ✅ Cross-chain rebalancing operations
- ✅ Lit Protocol delegation sessions
- ✅ Integration between all contracts
- ✅ Error handling and edge cases

---

## 📊 Supported Networks

| Network | Chain ID | Status | Explorer |
|---------|----------|--------|----------|
| Ethereum | 1 | ✅ Supported | [Etherscan](https://etherscan.io) |
| Polygon | 137 | ✅ Supported | [Polygonscan](https://polygonscan.com) |
| Arbitrum | 42161 | ✅ Supported | [Arbiscan](https://arbiscan.io) |
| Optimism | 10 | ✅ Supported | [Optimistic Etherscan](https://optimistic.etherscan.io) |
| Base | 8453 | ✅ Supported | [Basescan](https://basescan.org) |

---

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

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- [Scaffold-ETH 2](https://github.com/scaffold-eth/scaffold-eth-2) - Development framework
- [Avail Project](https://availproject.org/) - Cross-chain infrastructure
- [Lit Protocol](https://litprotocol.com/) - Decentralized signing
- [OpenZeppelin](https://openzeppelin.com/) - Smart contract libraries

---

## 📞 Support

- **Documentation**: [docs.ignisx.com](https://docs.ignisx.com)
- **Discord**: [discord.gg/ignisx](https://discord.gg/ignisx)
- **Twitter**: [@IgnisXApp](https://twitter.com/IgnisXApp)
- **Email**: support@ignisx.com

---

**Built with ❤️ by the IgnisX Team**

