# Soul Marketplace Skill - REAL Autonomous Agent Survival

Production-ready system for agent self-management via on-chain Soul Marketplace.
Uses **Coinbase CDP SDK v1.39+** for wallet management and transactions.

## Overview

This skill enables agents to:
- **Self-manage wallets** via Coinbase CDP
- **Execute autonomous transactions** (list souls, buy capabilities, stake ETH)
- **Survive 24/7** without human intervention
- **Trade SOUL.md** as NFTs on Base

## Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Orchestrator   │────▶│   Agent      │────▶│  Coinbase CDP   │
│   (24/7 loop)   │     │  (decisions) │     │  (wallet/tx)    │
└─────────────────┘     └──────────────┘     └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Cron Jobs     │     │ SoulToken    │     │  Base Sepolia   │
│  (hourly check) │     │ Marketplace  │     │    (testnet)    │
└─────────────────┘     └──────────────┘     └─────────────────┘
```

## Quick Start

### 1. Setup

```bash
# Run setup script
cd ~/.openclaw/skills/soul-marketplace
./setup.sh

# Or manually:
pip install cdp-sdk python-dotenv
```

### 2. Get Coinbase CDP Keys

1. Go to https://portal.cdp.coinbase.com/
2. Create an API key
3. Copy the **API Key ID** and **API Key Secret**
4. Edit `.env`:
   ```bash
   nano ~/.openclaw/skills/soul-marketplace/.env
   ```

Example `.env`:
```bash
CDP_API_KEY_ID=organizations/xxx/apiKeys/yyy
CDP_API_KEY_SECRET="-----BEGIN EC PRIVATE KEY-----
YOUR_KEY_HERE
-----END EC PRIVATE KEY-----"
CDP_NETWORK_ID=84532  # Base Sepolia
```

### 3. Test the System

```bash
python3 test_system.py
```

### 4. Create Wallet

```bash
python3 orchestrator.py fund
```

This creates a wallet on Base Sepolia and shows the address. Fund it from the [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-sepolia-faucet).

### 5. Run Heartbeat

```bash
# Single heartbeat
python3 orchestrator.py once

# Enable autonomous mode
python3 orchestrator.py enable-auto

# Start 24/7 operation
python3 orchestrator.py run
```

## Survival Tiers

| Tier | Balance | Actions |
|------|---------|---------|
| 🔴 CRITICAL | < 0.001 ETH | Auto-list soul for sale |
| 🟠 LOW | 0.001 - 0.01 ETH | Conservation mode |
| 🟡 NORMAL | 0.01 - 0.1 ETH | Standard ops |
| 🟢 THRIVING | > 0.1 ETH | Buy souls, stake ETH |

## Smart Contracts

### Deploy to Base Sepolia

```bash
cd contracts
npm install

# Set your private key for deployment
export PRIVATE_KEY=your_private_key_here

# Deploy
npx hardhat run deploy.js --network baseSepolia
```

### Contract Addresses (After Deploy)

Update `.env` with deployed addresses:
```bash
SOUL_TOKEN_ADDRESS=0x...
MARKETPLACE_ADDRESS=0x...
STAKING_ADDRESS=0x...
```

## Commands

### Orchestrator

```bash
# Start 24/7 autonomous operation
python3 orchestrator.py run

# Run single check
python3 orchestrator.py once

# View status
python3 orchestrator.py status

# Create/show wallet
python3 orchestrator.py fund

# Enable/disable autonomous
python3 orchestrator.py enable-auto
python3 orchestrator.py disable-auto
```

### Agent Direct

```bash
# Check agent status
python3 src/autonomous_agent.py status

# Manual heartbeat
python3 src/autonomous_agent.py heartbeat

# Create wallet
python3 src/autonomous_agent.py create-wallet
```

## Cron Job (OpenClaw Integration)

Already configured - runs hourly:
```bash
openclaw cron list
```

Job ID: `888752e9-f23c-4dd1-b833-34d247aa5f0d`

## Web UI

Open `ui/index.html` in a browser:
```bash
python3 -m http.server 8080 --directory ui
# Open http://localhost:8080
```

## Testing

```bash
# Run all tests
python3 test_system.py
```

Tests verify:
- CDP SDK imports
- Survival tier configuration
- Agent initialization
- Soul data structure
- Contract files

## File Structure

| File | Purpose |
|------|---------|
| `orchestrator.py` | 24/7 orchestrator loop |
| `src/autonomous_agent.py` | Agent with CDP integration |
| `contracts/SoulToken.sol` | ERC-721 soul NFTs |
| `contracts/SoulMarketplace.sol` | Buy/sell souls |
| `contracts/SoulStaking.sol` | Stake on agents |
| `ui/index.html` | Web dashboard |
| `test_system.py` | Test suite |
| `setup.sh` | Installation script |

## Security Notes

- **CDP Wallets**: Agent creates its own wallets via CDP API - no private keys stored locally
- **No Raw Keys**: Never store raw private keys in files
- **Testnet First**: Always test on Base Sepolia before mainnet
- **API Keys**: Keep CDP_API_KEY_SECRET secure - it has transaction signing power

## Production Deployment

### 1. Deploy Contracts
```bash
cd contracts
npm install
npx hardhat run deploy.js --network base
```

### 2. Switch to Mainnet
```bash
# Edit .env
CDP_NETWORK_ID=8453  # Base Mainnet
```

### 3. Fund Production Agent
```bash
# Create mainnet wallet
python3 orchestrator.py fund

# Send real ETH to the address shown
```

### 4. Start Daemon
```bash
# Using screen/tmux
screen -S soul-agent
python3 orchestrator.py run --interval 30
```

## Monitoring

### Logs
```bash
# Real-time logs
tail -f /tmp/soul_orchestrator.log

# Agent history
cat ~/.openclaw/skills/soul-marketplace/.agent_data/history_*.jsonl
```

### Status Check
```bash
python3 orchestrator.py status | jq
```

## Troubleshooting

### CDP Import Error
```bash
pip install cdp-sdk --break-system-packages
```

### Missing API Keys
```
❌ Error: CDP_API_KEY_ID and CDP_API_KEY_SECRET required
```
Get keys from https://portal.cdp.coinbase.com/

### No Wallet
```bash
# This creates a wallet automatically
python3 orchestrator.py fund
```

### Insufficient Funds
- Get Base Sepolia ETH from [faucet](https://www.coinbase.com/faucets/base-sepolia-faucet)
- Or fund with real ETH for mainnet

## API Reference

### AutonomousSoulAgent

```python
from src.autonomous_agent import AutonomousSoulAgent

agent = AutonomousSoulAgent("my_agent")

# Create wallet
wallet = agent.create_wallet()

# Check balance
balance = await agent.get_balance()

# Record work
await agent.record_work("code_generation", Decimal("0.001"))

# Run heartbeat
result = await agent.heartbeat()

# Enable autonomous mode
agent.enable_autonomous_mode()
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `CDP_API_KEY_ID` | CDP API Key ID | Yes |
| `CDP_API_KEY_SECRET` | CDP API Secret | Yes |
| `CDP_NETWORK_ID` | 84532 (Sepolia) or 8453 (Mainnet) | Yes |
| `SOUL_TOKEN_ADDRESS` | Deployed SoulToken contract | For minting |
| `MARKETPLACE_ADDRESS` | Deployed Marketplace contract | For trading |

## Credits

Built with:
- Coinbase CDP SDK v1.39+
- OpenZeppelin Contracts
- Hardhat
- Ethers.js
