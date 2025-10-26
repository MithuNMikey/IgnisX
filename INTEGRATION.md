# Integration Guide - Avail Nexus SDK & Lit Protocol Vincent

## Overview

IgnisX has been integrated with both **Avail Nexus SDK** and **Lit Protocol Vincent** for real cross-chain operations and delegated signing.

## 📦 Installed Packages

### Avail Nexus SDK
- **Package**: `@avail-project/nexus-core`
- **Version**: Latest
- **Documentation**: https://docs.availproject.org/nexus/avail-nexus-sdk
- **GitHub**: https://github.com/availproject/nexus-sdk

### Lit Protocol
- **Package**: `@lit-protocol/contracts-sdk` (v7.3.1)
- **Package**: `@lit-protocol/sdk-nodejs` (v1.1.250)
- **Documentation**: https://developer.litprotocol.com/

## 🔧 Integration Details

### 1. Lit Protocol Vincent Integration

**Service**: `packages/nextjs/services/litProtocolService.ts`

#### Features:
- ✅ **Real Lit Protocol SDK** integration with `LitNodeClient` and `LitContracts`
- ✅ **Threshold Signature Support** using Lit's distributed key generation
- ✅ **PKP (Programmable Key Pairs)** for delegation
- ✅ **Session Management** with expiration and operation limits
- ✅ **Policy-based Delegation** with cryptographic guarantees

#### Initialization:
```typescript
const litProtocolService = new LitProtocolService();
// Automatically initializes with Lit Network (Cayenne testnet)
```

#### Key Methods:
- `createDelegationSession()` - Creates a delegation session using Lit Protocol
- `signOperation()` - Signs operations using Lit's threshold signatures
- `verifySignedOperation()` - Verifies signed operations
- `revokeDelegationSession()` - Revokes a delegation session

### 2. Avail Nexus SDK Integration

**Service**: `packages/nextjs/services/availNexusService.ts`

#### Features:
- ✅ **Real Avail Nexus SDK** integration with `NexusSDK`
- ✅ **Cross-Chain Bridge** operations
- ✅ **Swap** functionality across chains
- ✅ **Unified Balance** management
- ✅ **Intent-based** routing

#### Initialization:
```typescript
await availNexusService.initialize(provider);
// provider should be a Web3Provider or EIP1193Provider
```

#### Key Methods:
- `findSwapRoute()` - Finds optimal swap routes using real Nexus SDK
- `findBridgeRoute()` - Finds bridge routes between chains
- `findCrossChainRoute()` - Finds cross-chain routes (bridges + swaps)
- `executeSwap()` - Executes swap transactions
- `executeBridge()` - Executes bridge transactions

## 🚀 Usage

### Initializing Services

```typescript
// In your Next.js app
import { availNexusService } from '~~/services/availNexusService';
import { litProtocolService } from '~~/services/litProtocolService';

// Get the provider from wagmi
const { data: walletClient } = useWalletClient();

useEffect(() => {
  if (walletClient) {
    // Initialize Avail Nexus with wallet provider
    availNexusService.initialize(walletClient);
  }
  
  // Lit Protocol auto-initializes
  // Configuration is in litProtocolService.ts
}, [walletClient]);
```

### Creating a Delegation Session

```typescript
const policy = {
  maxSlippage: 50, // 0.5% in basis points
  maxRebalanceAmount: "1000", // $1000
  rebalanceThreshold: 100, // 1%
  cooldownPeriod: 3600, // 1 hour
};

const session = await litProtocolService.createDelegationSession(
  userAddress,
  delegateAddress,
  policy,
  7 * 24 * 3600, // 7 days expiry
  100 // max operations
);
```

### Finding a Cross-Chain Route

```typescript
const route = await availNexusService.findCrossChainRoute(
  "0xA0b...", // USDC address on Ethereum
  "0x2791...", // USDC address on Polygon
  "100.0", // amount
  1, // from chain (Ethereum)
  137, // to chain (Polygon)
  0.5 // slippage tolerance (%)
);

// Route contains:
// - swaps: Array of swap steps
// - bridges: Array of bridge operations
// - totalGasEstimate
// - totalTimeEstimate
// - priceImpact
```

### Signing Operations

```typescript
const operation = await litProtocolService.signOperation(
  session,
  1, // operation type: 1=swap, 2=bridge, 3=rebalance
  JSON.stringify({
    tokenIn: "USDC",
    tokenOut: "DAI",
    amount: "100",
    chainId: 1
  })
);

// operation.signature contains Lit Protocol threshold signature
```

## 🌐 Supported Networks

### Mainnet (Avail Nexus)
- Ethereum (1)
- Polygon (137)
- Arbitrum (42161)
- Optimism (10)
- Base (8453)
- Avalanche (43114)
- Scroll (534352)
- BNB Chain (56)

### Testnet (Lit Protocol)
- **Network**: Cayenne (default)
- Custom networks can be configured

## ⚙️ Configuration

### Lit Protocol Configuration

```typescript
// In litProtocolService.ts
private async initializeLitClient() {
  this.litNodeClient = new LitNodeClient({
    litNetwork: 'cayenne', // 'cayenne' | 'custom' | 'manzano'
    debug: false,
  });
  
  this.litContracts = new LitContracts({
    network: 'cayenne',
    debug: false,
  });
}
```

### Avail Nexus Configuration

```typescript
// In availNexusService.ts
async initialize(provider: any) {
  this.nexusSDK = new NexusSDK({
    network: 'mainnet', // 'mainnet' | 'testnet'
  });
  
  await this.nexusSDK.initialize(provider);
}
```

## 🛡️ Security Features

### Lit Protocol Security
- **Threshold Signatures**: Operations require majority of Lit nodes to sign
- **Policy Enforcement**: Limits are enforced at the signature level
- **Time-bound Sessions**: Automatic expiration
- **Revocable**: Users can revoke delegation at any time
- **Non-custodial**: Users maintain control of keys

### Avail Nexus Security
- **Intent-based**: Users specify intent, not exact execution path
- **Solver Competition**: Multiple solvers compete for best routes
- **Transparent Pricing**: All fees and slippage are visible upfront
- **Slippage Protection**: Max slippage is enforced

## 🔄 Fallback Behavior

Both services have fallback mechanisms:

### Lit Protocol
- Falls back to mock implementation if SDK fails
- Logs errors for debugging
- Returns error messages to UI

### Avail Nexus
- Falls back to mock swap/bridge routes if SDK fails
- Returns dummy data for testing
- Logs errors for debugging

## 🐛 Troubleshooting

### Lit Protocol Issues

**Error**: "Lit Protocol client not initialized"
- **Solution**: The service auto-initializes. Check console logs for errors.

**Error**: "Session expired"
- **Solution**: Create a new delegation session with longer expiry.

### Avail Nexus Issues

**Error**: "Avail Nexus SDK not initialized"
- **Solution**: Call `availNexusService.initialize(provider)` with a valid wallet provider.

**Error**: "Token not supported"
- **Solution**: Add the token to `supportedTokens` array in the service.

## 📝 API Reference

See the full API documentation:
- [Lit Protocol API](https://developer.litprotocol.com/)
- [Avail Nexus SDK Reference](https://docs.availproject.org/nexus/avail-nexus-sdk)

## 🧪 Testing

### Running Tests

```bash
# Test Lit Protocol integration
yarn test litProtocolService.test.ts

# Test Avail Nexus integration  
yarn test availNexusService.test.ts
```

### Development Mode

Both services work in development mode with:
- Mock data fallback
- Error logging
- Debug mode enabled

## 📚 Additional Resources

- [Avail Nexus GitHub](https://github.com/availproject/nexus-sdk)
- [Lit Protocol Documentation](https://developer.litprotocol.com/)
- [IgnisX GitHub](https://github.com/your-org/ignisx)

## ✨ Next Steps

1. **Configure RPC URLs** - Update RPC endpoints in the service files
2. **Set API Keys** - Add Infura/Alchemy keys for production
3. **Deploy Contracts** - Deploy IgnisX contracts to mainnet
4. **Test Integration** - Test with real transactions on testnets
5. **Monitor** - Set up monitoring for signature threshold issues

