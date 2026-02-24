#!/bin/bash
# Quick setup for Base Sepolia deployment

echo "🚀 Quick Sepolia Setup"
echo "======================"

# Step 1: Get Sepolia ETH from faucet
echo ""
echo "Step 1: Get Base Sepolia ETH"
echo "   1. Go to: https://www.coinbase.com/faucets/base-sepolia-faucet"
echo "   2. Enter address: 0xBe5DAd52427Fa812C198365AAb6fe916E1a61269"
echo "   3. Get 0.1 ETH (free, once per day)"
echo ""
read -p "Press Enter once you have Sepolia ETH..."

# Step 2: Update .env for Sepolia
echo ""
echo "Step 2: Updating .env for Sepolia..."
cd ~/.openclaw/skills/soul-marketplace

# Backup current .env
cp .env .env.mainnet.backup

# Update network
cat > .env.sepolia << 'EOF'
# Wallet Private Key (same as mainnet)
PRIVATE_KEY=0x1ece4e4e417a32f1d46c01fd903f7174d1116fa61055f396725ba06e5bba9245

# Coinbase CDP API Keys
CDP_API_KEY_ID=a03f2033-4eae-498f-8da6-53cae297cba5
CDP_API_KEY_SECRET=bip6uPkv050GQxRMPCnY9FO26Xi5kZnUfWH34Hl/uoMXwgxRd06MSmaOGQP+xYjDJDDL8m6H//i4bt9MOWmSvA==
CDP_WALLET_SECRET=MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgsW2b0NYGmwgPsXLOTSceBfxfeNCqOKBn+eII22N4cIyhRANCAAT83gIx54RGeXS0S+M5cmiyX1GKZxOvVTyeZuadxcc7OTHsoFr0K86sU7MiySNoUBQ87RbJuganiigmXoMJI0NG

# Network Configuration - SEPOLIA
CDP_NETWORK_ID=84532

# RPC URLs
BASE_RPC=https://sepolia.base.org

# Bankr API
BANKR_API_KEY=bk_9D3842KZUSJJSVXZM8YGCEKGWA99523W

# Contract Addresses (will be filled after deploy)
SOUL_TOKEN_ADDRESS=
MARKETPLACE_ADDRESS=
STAKING_ADDRESS=
EOF

cp .env.sepolia .env

echo "✅ .env updated for Sepolia"

# Step 3: Deploy
echo ""
echo "Step 3: Deploying contracts..."
cd contracts

# Deploy SoulToken first
echo "   Deploying SoulToken..."
npx hardhat run deploy.js --network baseSepolia 2>&1 | tee deploy.log

# Get address from deploy.log
SOUL_TOKEN=$(grep -oP '0x[a-fA-F0-9]{40}' deploy.log | head -1)
echo "   SoulToken: $SOUL_TOKEN"

# Update .env with SoulToken address
sed -i "s/SOUL_TOKEN_ADDRESS=/SOUL_TOKEN_ADDRESS=$SOUL_TOKEN/" ../.env

# Deploy Marketplace
echo "   Deploying SoulMarketplace..."
npx hardhat run deploy-marketplace.js --network baseSepolia 2>&1 | tee marketplace.log

MARKETPLACE=$(grep -oP '0x[a-fA-F0-9]{40}' marketplace.log | head -1)
echo "   Marketplace: $MARKETPLACE"

sed -i "s/MARKETPLACE_ADDRESS=/MARKETPLACE_ADDRESS=$MARKETPLACE/" ../.env

echo ""
echo "✅ Deployment complete!"
echo "   SoulToken: $SOUL_TOKEN"
echo "   Marketplace: $MARKETPLACE"
echo ""
echo "Step 4: Test transactions"
echo "   python3 test-real-transactions.py"
