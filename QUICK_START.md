# ⚡ Quick Start Guide - IgnisX Sepolia Demo

## 🎯 Goal
Deploy and demo IgnisX on Sepolia testnet

---

## 📝 Step-by-Step Setup

### 1️⃣ Get Credentials (10 minutes)

**A. Alchemy API Key**
1. Go to https://www.alchemy.com/
2. Sign up → Create App → Select Sepolia
3. Copy API Key

**B. WalletConnect Project ID**
1. Go to https://cloud.walletconnect.com
2. Sign in with GitHub
3. Create Project → Copy Project ID

**C. Sepolia ETH**
1. Get from https://www.alchemy.com/faucets/ethereum-sepolia
2. Send to your deployer wallet

---

### 2️⃣ Configure Environment (5 minutes)

Create `.env.local` in `packages/nextjs/`:

```env
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
```

Create `.env` in project root:

```env
ALCHEMY_API_KEY=your_alchemy_key
__RUNTIME_DEPLOYER_PRIVATE_KEY=your_deployer_private_key
ETHERSCAN_V2_API_KEY=your_etherscan_key
```

---

### 3️⃣ Install Dependencies (5 minutes)

```bash
yarn install
```

---

### 4️⃣ Deploy Contracts (10 minutes)

```bash
cd packages/hardhat
yarn deploy --network sepolia
```

Save the contract addresses!

---

### 5️⃣ Start Frontend (2 minutes)

```bash
cd ../..
yarn start
```

Open: http://localhost:3000

---

### 6️⃣ Test Application

1. Connect MetaMask (Sepolia network)
2. Create portfolio
3. Add assets
4. Test autopilot

---

## 🎤 Demo Script (5 minutes total)

### Introduction (30s)
- "IgnisX is a trustless multi-chain portfolio autopilot"
- "I'll show you it deployed on Sepolia"

### UI Tour (1m)
- Beautiful modern UI with gradients
- Navigate tabs
- Show portfolio dashboard

### Features (2m)
- Asset management
- Lit Protocol delegation
- Avail Nexus bridges

### Technical Deep Dive (1m)
- Show deployed contracts on Etherscan
- Explain security model
- Multi-chain architecture

### Q&A (30s)
- Open for questions

---

## ✅ Pre-Demo Checklist

```bash
# Verify everything works
[ ] .env files configured
[ ] Dependencies installed (yarn install)
[ ] Contracts deployed (yarn deploy --network sepolia)
[ ] Frontend running (yarn start)
[ ] Wallet connected
[ ] Can create portfolio
```

---

## 🐛 Common Issues

**No Sepolia ETH?**
→ https://www.alchemy.com/faucets/ethereum-sepolia

**RPC Error?**
→ Check Alchemy API key in .env

**Deployment Failed?**
→ Check deployer has Sepolia ETH

---

## 📞 Need Help?

Check `SEPOLIA_SETUP.md` for detailed instructions.

Good luck! 🚀

