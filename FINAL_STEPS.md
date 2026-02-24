# 🚀 FINAL DEPLOYMENT STEPS

## Current Status (February 23, 2026 - 9:00 PM)

✅ **DONE:**
- All smart contract tests passing (10/10)
- Gas optimized contracts
- Full integration system
- Documentation complete
- Git commits ready

🚧 **BLOCKED:** Need 0.005 ETH for deployer gas

---

## 📍 Wallet Addresses

| Wallet | Address | Network | Balance | Status |
|--------|---------|---------|---------|--------|
| **CDP Wallet** | 0xBe5DAd52427Fa812C198365AAb6fe916E1a61269 | Base Mainnet | 0.014 ETH | ✅ Funded |
| **Hardhat Deployer** | 0xff310EDf4f8d2F7FBc4EfD09D1E7D5Ab0E2D2131 | Base Mainnet | 0 ETH | ❌ Empty |
| **Hardhat Deployer** | 0xff310EDf4f8d2F7FBc4EfD09D1E7D5Ab0E2D2131 | Base Sepolia | 0 ETH | ❌ Empty |

---

## OPTION 1: Use Bankr Telegram (Easiest - 2 minutes)

1. Open Telegram
2. Message @bankrbot
3. Send:
   ```
   Send 0.005 ETH to 0xff310EDf4f8d2F7FBc4EfD09D1E7D5Ab0E2D2131 on Base
   ```
4. Confirm the transaction

Then deploy:
```bash
cd ~/.openclaw/skills/soul-marketplace/contracts
npx hardhat run deploy-marketplace.js --network base
```

---

## OPTION 2: Use CDP Portal (2 minutes)

1. Go to: https://portal.cdp.coinbase.com/
2. Select your wallet (0xBe5DAd...)
3. Click "Send"
4. Enter:
   - To: `0xff310EDf4f8d2F7FBc4EfD09D1E7D5Ab0E2D2131`
   - Amount: 0.005 ETH
5. Confirm

Then deploy:
```bash
cd ~/.openclaw/skills/soul-marketplace/contracts
npx hardhat run deploy-marketplace.js --network base
```

---

## OPTION 3: Use Base Sepolia (FREE - Recommended for Testing)

### Step 1: Get Free Sepolia ETH
1. Go to: https://www.coinbase.com/faucets/base-sepolia-faucet
2. Enter address: `0xff310EDf4f8d2F7FBc4EfD09D1E7D5Ab0E2D2131`
3. Get 0.1 ETH (free, once per day)

### Step 2: Deploy on Sepolia
```bash
cd ~/.openclaw/skills/soul-marketplace
python3 deploy-sepolia.py
```

This will:
- Deploy SoulToken
- Deploy SoulMarketplace
- Save addresses to SEPOLIA_DEPLOYMENT.json
- Cost: ~0.0001 ETH (basically free)

### Step 3: Test Real Transactions
```bash
python3 test-real-transactions.py
```

---

## OPTION 4: Manual Bankr CLI

```bash
cd ~/.openclaw/skills/soul-marketplace
bankr send 0.005 ETH to 0xff310EDf4f8d2F7FBc4EfD09D1E7D5Ab0E2D2131 on Base
```

Wait for confirmation, then:
```bash
cd contracts
npx hardhat run deploy-marketplace.js --network base
```

---

## 📊 After Deployment

### Update .env
```bash
# Add the new contract addresses to .env
nano ~/.openclaw/skills/soul-marketplace/.env
```

Add:
```
MARKETPLACE_ADDRESS=0x...
STAKING_ADDRESS=0x...
```

### Verify on Basescan
```bash
cd contracts
npx hardhat verify --network baseMainnet [MARKETPLACE_ADDRESS] [SOUL_TOKEN_ADDRESS] [FEE_RECIPIENT]
```

### Test Real Transactions
```bash
python3 test-real-transactions.py
```

### Push to GitHub
```bash
./push-to-github.sh
```

---

## 🎯 Summary

**To finish this project:**

1. **Fund deployer** (choose Option 1, 2, 3, or 4 above)
2. **Deploy contracts** (5 minutes)
3. **Test transactions** (5 minutes)
4. **Push to GitHub** (1 minute)

**Total time: ~15 minutes**

---

## 📞 Files Ready

All files are committed and ready:
- ✅ Smart contracts (gas optimized)
- ✅ All tests passing
- ✅ Deployment scripts
- ✅ Real transaction tests
- ✅ Integration system
- ✅ Documentation

**Location:** `~/.openclaw/skills/soul-marketplace/`

---

**Status:** Code 100% complete. Just needs gas funding to deploy.
