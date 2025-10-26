# 🚀 IgnisX Sepolia Testnet Setup Guide

This guide will help you set up IgnisX on Sepolia testnet and prepare for your demo.

## 📋 Prerequisites

Before you start, make sure you have:

- ✅ Node.js (v18 or higher)
- ✅ Yarn package manager
- ✅ A MetaMask wallet
- ✅ Sepolia ETH testnet tokens
- ✅ Alchemy account (free)
- ✅ WalletConnect project (free)

---

## 🔑 Step 1: Get Your Credentials

### A. Alchemy API Key (Required)

1. **Sign up at Alchemy**
   - Go to https://www.alchemy.com/
   - Click "Create account" or "Sign in"
   - Complete the signup process

2. **Create a new app**
   - Click "Apps" → "Create App"
   - Name: `IgnisX`
   - Select **Sepolia** testnet
   - Click "Create App"

3. **Copy your API Key**
   - Open your app dashboard
   - Copy the "HTTP" API key
   - Save it for Step 2

### B. WalletConnect Project ID (Required)

1. **Sign up at WalletConnect Cloud**
   - Go to https://cloud.walletconnect.com
   - Sign in with GitHub

2. **Create a new project**
   - Click "Create Project"
   - Name: `IgnisX`
   - Click "Create"

3. **Copy your Project ID**
   - You'll see your Project ID in the dashboard
   - Copy it for Step 2

### C. Sepolia ETH (Required)

You need Sepolia ETH to pay for gas fees:

1. **Get from Alchemy Faucet** (Recommended)
   - Go to https://www.alchemy.com/faucets/ethereum-sepolia
   - Connect your wallet
   - Request 0.5 Sepolia ETH (enough for testing)

2. **Alternative Faucets**
   - https://sepoliafaucet.com/
   - https://faucet.sepolia.dev/

3. **Import account to MetaMask**
   - Make sure your wallet is connected to Sepolia network
   - Add Sepolia network if needed:
     - Network name: `Sepolia`
     - RPC URL: `https://sepolia.infura.io/v3/`
     - Chain ID: `11155111`
     - Currency: `ETH`
     - Block Explorer: `https://sepolia.etherscan.io`

---

## 📝 Step 2: Configure Environment Variables

1. **Create `.env` file**
   ```bash
   cp .env.example .env
   ```

2. **Open `.env` file** and fill in your credentials:
   ```env
   # Alchemy API Key
   NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key_here
   ALCHEMY_API_KEY=your_alchemy_key_here
   
   # WalletConnect Project ID
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id_here
   
   # Deployer Private Key (from the account you funded)
   __RUNTIME_DEPLOYER_PRIVATE_KEY=your_private_key_here
   
   # Etherscan API Key (optional)
   ETHERSCAN_V2_API_KEY=your_etherscan_key_here
   ```

   **⚠️ IMPORTANT:**
   - Never commit your `.env` file to Git
   - Never share your private keys
   - The `.env` file is already in `.gitignore`

---

## 🏗️ Step 3: Install Dependencies

```bash
# Install all dependencies
yarn install

# This will install packages for both hardhat and nextjs
```

---

## 🪙 Step 4: Add Sepolia ETH to Your Deployer Account

1. **Check which account will be used for deployment**
   ```bash
   cd packages/hardhat
   yarn account:list
   ```

2. **If no account exists, generate one**
   ```bash
   yarn account:new
   ```
   
3. **Send Sepolia ETH to your deployer account**
   - Copy the address from step 1
   - Send 0.5 Sepolia ETH to this address
   - Use one of the faucets from Step 1C

4. **Verify balance**
   ```bash
   yarn account:balance <your_address>
   ```

---

## 🚀 Step 5: Deploy Contracts to Sepolia

```bash
# Make sure you're in the hardhat directory
cd packages/hardhat

# Deploy contracts to Sepolia
yarn deploy --network sepolia

# This will deploy:
# - IgnisX.sol
# - PortfolioManager.sol
# - LitProtocolDelegate.sol
# - CrossChainRebalancer.sol
```

**Expected output:**
```
Deploying IgnisX to Sepolia...
✖ IgnisX deployed to: 0x...
Contract deployed at: 0x...
```

**Save the deployed contract addresses!** You'll need them for verification.

---

## ✅ Step 6: Verify Contracts (Optional)

```bash
# Verify on Etherscan
yarn hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

---

## 🎨 Step 7: Start the Frontend

```bash
# From the project root
yarn start

# Or from packages/nextjs
cd packages/nextjs
yarn dev
```

The app will be available at: **http://localhost:3000**

---

## 🧪 Step 8: Test the Application

1. **Connect Your Wallet**
   - Open http://localhost:3000
   - Click "Connect Wallet"
   - Select MetaMask
   - Make sure you're on Sepolia network

2. **Fund Your Wallet**
   - Get testnet tokens from faucets
   - Make sure your wallet has Sepolia ETH

3. **Test Portfolio Features**
   - Create a portfolio
   - Add assets
   - Enable autopilot delegation
   - View history

---

## 🎤 Demo Preparation

### What to Show:

1. **Landing Page**
   - Beautiful hero section with gradient
   - Feature cards

2. **Portfolio Dashboard**
   - Multi-chain asset view
   - Value tracking

3. **Asset Management**
   - Add/remove assets
   - Set target allocations

4. **Autopilot Delegation**
   - Lit Protocol integration
   - Policy settings
   - Security transparency

5. **Cross-Chain Operations**
   - Avail Nexus bridge
   - Swap functionality

### Demo Script:

```
1. Introduction (30 seconds)
   - "IgnisX is a trustless multi-chain portfolio autopilot"
   - "Built on Lit Protocol and Avail Nexus"
   - "Deployed on Sepolia testnet"

2. Features Demo (2 minutes)
   - Show the UI/UX improvements
   - Navigate through tabs
   - Explain key features

3. Technical Highlights (1 minute)
   - Lit Protocol delegation
   - Avail Nexus bridges
   - Multi-chain support

4. Live Interaction (1 minute)
   - Connect wallet
   - Create portfolio
   - Show actual deployment addresses

5. Closing (30 seconds)
   - Security benefits
   - Real-world use cases
```

---

## 🐛 Troubleshooting

### Problem: "Insufficient funds for gas"
**Solution**: Get more Sepolia ETH from faucets

### Problem: "RPC Error"
**Solution**: Check your Alchemy API key in `.env`

### Problem: "Contract deployment failed"
**Solution**: 
- Verify your deployer has Sepolia ETH
- Check the private key is correct
- Try again after 10 seconds

### Problem: "Can't connect wallet"
**Solution**:
- Make sure WalletConnect project ID is correct
- Try refreshing the page
- Clear browser cache

---

## 📚 Additional Resources

- **Sepolia Faucet**: https://sepoliafaucet.com/
- **Sepolia Explorer**: https://sepolia.etherscan.io
- **Alchemy Dashboard**: https://dashboard.alchemyapi.io
- **WalletConnect Cloud**: https://cloud.walletconnect.com
- **Lit Protocol Docs**: https://developer.litprotocol.com/
- **Avail Nexus Docs**: https://docs.availproject.org/nexus

---

## ✅ Checklist

Before your demo, verify:

- [ ] `.env` file configured with all credentials
- [ ] Deployer account has Sepolia ETH
- [ ] Contracts deployed to Sepolia
- [ ] Frontend running on localhost:3000
- [ ] Can connect wallet to app
- [ ] All features working (at least one portfolio created)
- [ ] Contract addresses saved
- [ ] Demo script prepared

---

## 🎯 Quick Start Commands

```bash
# 1. Configure environment
cp .env.example .env
# Edit .env with your credentials

# 2. Install dependencies
yarn install

# 3. Deploy to Sepolia
cd packages/hardhat
yarn deploy --network sepolia

# 4. Start frontend
cd ../..
yarn start

# 5. Open browser
# http://localhost:3000
```

---

**Good luck with your demo! 🚀**

