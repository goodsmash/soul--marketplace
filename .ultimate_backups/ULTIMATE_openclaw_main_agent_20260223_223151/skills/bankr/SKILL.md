---
name: bankr
description: AI-powered crypto trading agent. Use when the user wants to trade crypto, check balances, view prices, transfer crypto, or use DeFi operations. API key is configured.
metadata:
  {
    "clawdbot":
      {
        "emoji": "📺",
        "homepage": "https://bankr.bot",
        "requires": { "bins": ["bankr"] },
      },
  }
---

# Bankr

Execute crypto trading and DeFi operations.

## API Configuration ✅

**Status:** API key stored
**Key:** bk_9D3842KZUSJJSVXZM8YGCEKGWA99523W (Agent API needed)
**Email:** ryanmcginley10@gmail.com

## Setup

The API key needs Agent API access enabled:

1. Visit https://bankr.bot/api
2. Sign in with: ryanmcginley10@gmail.com  
3. Find API key: bk_9D3842KZUSJJSVXZM8YGCEKGWA99523W
4. Enable "Agent API" toggle
5. Run: `bankr balance`

## Available Commands

```bash
# Check all wallet balances
bankr balance

# Check specific chain
bankr balance --chain base
bankr balance --chain ethereum
bankr balance --chain solana

# Get token price
bankr price ETH
bankr price BTC

# Transfer crypto
bankr send 0.1 ETH to 0x...

# Trade on Polymarket
bankr bet "Will BTC hit 100k?" --amount 10 --position yes

# Deploy token
bankr deploy-token "MyToken" "MTK" --supply 1000000
```

## Usage Examples

- "Check my ETH balance"
- "What's the price of Bitcoin?"
- "Send 0.5 ETH to 0x123..."
- "Bet 10 USDC on Polymarket"

## Troubleshooting

If you get "Agent API access disabled":
1. Go to bankr.bot/api
2. Enable Agent API for your key
3. Try command again
