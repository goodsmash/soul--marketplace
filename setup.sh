#!/bin/bash
# Setup script for Soul Marketplace - Real On-Chain Deployment
# Usage: ./setup.sh

set -e

echo "🧠 Soul Marketplace - Autonomous Agent Survival Setup"
echo "======================================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SKILL_DIR="$HOME/.openclaw/skills/soul-marketplace"
cd "$SKILL_DIR"

echo -e "${BLUE}Step 1: Installing Python dependencies...${NC}"
pip install -q cdp-sdk python-dotenv 2>/dev/null || pip install cdp-sdk python-dotenv --break-system-packages 2>/dev/null || echo "Note: pip install failed - install manually"

echo -e "${BLUE}Step 2: Setting up contract dependencies...${NC}"
if [ ! -d "$SKILL_DIR/contracts/node_modules" ]; then
    cd "$SKILL_DIR/contracts"
    npm install 2>/dev/null || echo "npm install skipped - install manually if deploying contracts"
    cd "$SKILL_DIR"
fi

echo -e "${BLUE}Step 3: Creating environment file...${NC}"
if [ ! -f "$SKILL_DIR/.env" ]; then
    cat > "$SKILL_DIR/.env" << 'EOF'
# Coinbase CDP API Keys
# Get these from https://portal.cdp.coinbase.com/
# Required for the agent to create wallets and send transactions

CDP_API_KEY_ID=organizations/YOUR_ORG_ID/apiKeys/YOUR_KEY_ID
CDP_API_KEY_SECRET="-----BEGIN EC PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END EC PRIVATE KEY-----"

# Network Configuration
# 84532 = Base Sepolia (testnet) - USE THIS FOR TESTING
# 8453 = Base Mainnet (production) - ONLY USE WITH REAL MONEY
CDP_NETWORK_ID=84532

# RPC URLs (optional - CDP provides defaults)
BASE_SEPOLIA_RPC=https://sepolia.base.org
BASE_RPC=https://mainnet.base.org

# Deployed Contract Addresses (update after deploying contracts)
SOUL_TOKEN_ADDRESS=
MARKETPLACE_ADDRESS=
STAKING_ADDRESS=

# Optional: Basescan API key for contract verification
BASESCAN_API_KEY=
EOF
    echo -e "${YELLOW}Created .env file - please edit with your API keys${NC}"
else
    echo -e "${GREEN}.env file already exists${NC}"
fi

echo -e "${BLUE}Step 4: Creating data directories...${NC}"
mkdir -p "$SKILL_DIR/.agent_data"
mkdir -p "$SKILL_DIR/.orchestrator"
mkdir -p "$SKILL_DIR/logs"

echo -e "${BLUE}Step 5: Setting permissions...${NC}"
chmod +x "$SKILL_DIR/orchestrator.py"
chmod +x "$SKILL_DIR/src/autonomous_agent.py"
chmod +x "$SKILL_DIR/contracts/deploy.js"
chmod +x "$SKILL_DIR/test_system.py"

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. Get Coinbase CDP API keys:"
echo "   https://portal.cdp.coinbase.com/"
echo ""
echo "2. Edit .env file with your keys:"
echo "   nano ~/.openclaw/skills/soul-marketplace/.env"
echo ""
echo "3. Test the system:"
echo "   cd ~/.openclaw/skills/soul-marketplace"
echo "   python3 test_system.py"
echo ""
echo "4. Register your agent:"
echo "   python3 orchestrator.py register openclaw_main_agent"
echo ""
echo "5. Create wallet and fund:"
echo "   python3 orchestrator.py fund"
echo "   # Then get ETH from: https://www.coinbase.com/faucets/base-sepolia-faucet"
echo ""
echo "6. Enable autonomous mode:"
echo "   python3 orchestrator.py enable-auto"
echo ""
echo "7. Start 24/7 operation:"
echo "   python3 orchestrator.py run"
echo ""
echo "Or deploy contracts (optional):"
echo "   cd ~/.openclaw/skills/soul-marketplace/contracts"
echo "   npm install"
echo "   npx hardhat run deploy.js --network baseSepolia"
echo ""
