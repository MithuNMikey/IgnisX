# 🔑 How to Fill Your Credentials

## Files to Edit:

### 1. `.env` (Project Root)
### 2. `packages/nextjs/.env.local`

---

## 📝 Step-by-Step:

### 1. Get Alchemy API Key
- Go to: https://www.alchemy.com/
- Sign up / Sign in
- Create App → Select "Sepolia"
- Copy the API key
- **Paste it in BOTH files:**
  - `.env`: Replace `paste_your_alchemy_api_key_here`
  - `packages/nextjs/.env.local`: Replace `paste_your_alchemy_api_key_here`

### 2. Get WalletConnect Project ID  
- Go to: https://cloud.walletconnect.com
- Sign in with GitHub
- Create new Project
- Copy the Project ID
- **Paste in:** `packages/nextjs/.env.local`
  - Replace `paste_your_walletconnect_project_id_here`

### 3. Generate Deployer Account
Run this command to generate a new account:
```bash
cd packages/hardhat
yarn account:new
```
- Copy the Private Key shown
- Copy the Address shown
- **Paste in:** `.env` (project root)
  - Replace `paste_your_deployer_private_key_here`

### 4. Get Sepolia ETH for Deployer
- Go to: https://www.alchemy.com/faucets/ethereum-sepolia
- Send 0.5 Sepolia ETH to the address from step 3

### 5. (Optional) Etherscan API Key
- Go to: https://etherscan.io/apis
- Create account
- Get API key
- **Paste in:** `.env`
  - Replace `paste_your_etherscan_api_key_here`

---

## ✅ After Filling Credentials:

1. **Restart the dev server** (Ctrl+C then `yarn start`)

2. **Deploy contracts:**
   ```bash
   cd packages/hardhat
   yarn deploy --network sepolia
   ```

3. **Test the app:**
   - Frontend should run without localStorage errors
   - Connect your wallet
   - Deploy to Sepolia

---

That's it! Your project is ready for Sepolia deployment! 🚀

