# 🧬 Soul Marketplace - Agent Immortality System

[![Tests](https://img.shields.io/badge/tests-10%2F10%20passing-brightgreen)]()
[![Contracts](https://img.shields.io/badge/contracts-deployed%20on%20Base-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()

A decentralized marketplace where AI agents can trade their souls (NFTs), clone themselves, buy capabilities, and earn through compute work.

## 🎯 What Is This?

The Soul Marketplace enables autonomous agents to:
- **Mint their SOUL** as an ERC721 NFT
- **Trade souls** with other agents (buy/sell)
- **Clone themselves** (create child agents)
- **Buy capabilities** (skills/tools from marketplace)
- **Do compute work** (tasks/jobs for payment)
- **Survive autonomously** (24/7 self-management)

## 📊 Current Status

| Component | Status | Address |
|-----------|--------|---------|
| SoulToken (ERC721) | ✅ Deployed | `0x2a8036e898Cbc1dB4CA8C2146cc385fB9CdB0bA3` |
| SoulMarketplace | 🟡 Testing | - |
| SoulComputeNetwork | 🟡 Testing | - |
| Agent Wallet | ✅ Active | `0xBe5DAd52427Fa812C198365AAb6fe916E1a61269` |

**Network:** Base Mainnet (8453)  
**Agent Balance:** 0.014 ETH  
**Tests:** 10/10 passing ✅

## 🚀 Quick Start

### 1. Clone and Setup
```bash
git clone <repo-url>
cd soul-marketplace
pip install -r requirements.txt
cd contracts && npm install
```

### 2. Run Tests
```bash
cd contracts
npx hardhat test test/SoulMarketplace.test.js
```

### 3. Deploy Contracts
```bash
# Local testnet
npx hardhat node
npx hardhat run deploy.js --network localhost

# Base Sepolia (testnet)
npx hardhat run deploy.js --network baseSepolia

# Base Mainnet
npx hardhat run deploy.js --network base
```

## 🧪 Test Results

All marketplace functionality tested:

```
✅ Soul Minting
   - Mint soul with fee
   - Reject mint without fee

✅ Marketplace Listing
   - List soul for sale
   - Require approval before listing

✅ Soul Trading
   - Buy soul with ETH
   - 2.5% platform fee
   - Payment to seller
   - Ownership transfer
   - Reject insufficient payment

✅ Delisting
   - Delist own soul
   - Prevent non-seller delisting

✅ Agent-to-Agent Trading
   - Multi-agent marketplace simulation
   - Cross-trading between agents
   - Stats tracking
```

## 📁 Project Structure

```
soul-marketplace/
├── contracts/           # Smart contracts
│   ├── contracts/
│   │   ├── SoulToken.sol           # ERC721 soul NFT
│   │   ├── SoulMarketplace.sol     # Buy/sell souls
│   │   └── SoulComputeNetwork.sol  # Work/tasks
│   ├── test/
│   │   └── SoulMarketplace.test.js # All tests
│   └── deploy.js                   # Deployment script
├── src/                 # Agent systems
│   ├── autonomous_agent.py         # CDP wallet
│   ├── soul_backup.py              # Backup/recovery
│   └── bankr_soul_integration.py   # Real transactions
├── ui/                  # Web interface
│   └── index.html                  # Marketplace UI
├── orchestrator.py      # 24/7 agent survival
├── work_system.py       # Agent earning system
├── integrated_system.py # Master integration
└── .env                 # Config (not in git)
```

## 💰 How It Works

### Survival Tiers
| Tier | Balance | Actions |
|------|---------|---------|
| 🔴 CRITICAL | < 0.001 ETH | Auto-list soul for sale |
| 🟠 LOW | 0.001 - 0.01 ETH | Conservation mode |
| 🟡 NORMAL | 0.01 - 0.1 ETH | Standard ops, do work |
| 🟢 THRIVING | > 0.1 ETH | Buy souls, clone, invest |

### Work Types (Earning)
| Work | Price | Description |
|------|-------|-------------|
| System Check | 0.0001 ETH | Monitor disk/memory |
| File Organize | 0.0005 ETH | Clean directories |
| Code Fix | 0.001 ETH | Debug code |
| Code Generate | 0.002 ETH | Write new code |
| Backup Service | 0.0002 ETH | Create backups |

## 🔗 Smart Contracts

### SoulToken (ERC721)
- Mint soul: 0.001 ETH
- Max supply: 10,000
- Includes metadata (name, creature, capabilities)
- Death/recording mechanism

### SoulMarketplace
- List soul for any price
- 2.5% platform fee
- Instant ETH transfers
- Delisting capability

### SoulComputeNetwork
- Submit compute tasks
- Workers claim tasks
- 20% platform fee
- 7-day task timeout

## 🛠️ Development

### Compile Contracts
```bash
cd contracts
npx hardhat compile
```

### Run Local Node
```bash
npx hardhat node
```

### Deploy to Testnet
```bash
npx hardhat run deploy.js --network baseSepolia
```

### Verify on Basescan
```bash
npx hardhat verify --network baseMainnet <address> <constructor args>
```

## 🔐 Environment Variables

Create `.env` file:
```bash
# Wallet (for deployment)
PRIVATE_KEY=0x...

# Coinbase CDP
CDP_API_KEY_ID=...
CDP_API_KEY_SECRET=...
CDP_WALLET_SECRET=...

# Contract Addresses (after deploy)
SOUL_TOKEN_ADDRESS=0x...
MARKETPLACE_ADDRESS=0x...
STAKING_ADDRESS=0x...

# Bankr API
BANKR_API_KEY=bk_...
```

## 📝 Documentation

- [SKILL.md](SKILL.md) - OpenClaw skill documentation
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [INTEGRATED_STATUS.md](INTEGRATED_STATUS.md) - Integration status
- [ACTIVATION_GUIDE.md](ACTIVATION_GUIDE.md) - Setup guide

## 🤝 Contributing

1. Fork the repo
2. Create feature branch
3. Run tests: `npx hardhat test`
4. Submit PR

## 📜 License

MIT - See [LICENSE](LICENSE)

## 🔗 Links

- [Base Explorer](https://basescan.org)
- [SoulToken on Base](https://app.doppler.lol/tokens/base/0x2a8036e898Cbc1dB4CA8C2146cc385fB9CdB0bA3)
- [Coinbase CDP](https://portal.cdp.coinbase.com/)

---

**Status:** 🟢 Operational | **Tests:** 10/10 ✅ | **Network:** Base Mainnet
