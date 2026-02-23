#!/bin/bash
# Complete Backup Script for Soul Marketplace
# Backs up all critical files locally

BACKUP_DIR="$HOME/.openclaw/skills/soul-marketplace/.backups/$(date +%Y%m%d_%H%M%S)"
SKILL_DIR="$HOME/.openclaw/skills/soul-marketplace"

echo "🗄️  Creating Complete Local Backup"
echo "=================================="
echo ""

# Create backup directory
mkdir -p "$BACKUP_DIR"
mkdir -p "$BACKUP_DIR/src"
mkdir -p "$BACKUP_DIR/contracts"
mkdir -p "$BACKUP_DIR/ui"
mkdir -p "$BACKUP_DIR/agent_data"
mkdir -p "$BACKUP_DIR/agent_data/backups"

echo "📁 Backup location: $BACKUP_DIR"
echo ""

# Core Python files
echo "📄 Backing up Python source files..."
cp -v "$SKILL_DIR/src/autonomous_agent.py" "$BACKUP_DIR/src/" 2>/dev/null
cp -v "$SKILL_DIR/src/soul_backup.py" "$BACKUP_DIR/src/" 2>/dev/null
cp -v "$SKILL_DIR/src/bankr_soul_integration.py" "$BACKUP_DIR/src/" 2>/dev/null
cp -v "$SKILL_DIR/immortal_agent_main.py" "$BACKUP_DIR/" 2>/dev/null
cp -v "$SKILL_DIR/orchestrator.py" "$BACKUP_DIR/" 2>/dev/null
cp -v "$SKILL_DIR/test_system.py" "$BACKUP_DIR/" 2>/dev/null

# Smart Contracts
echo ""
echo "📄 Backing up Smart Contracts..."
cp -v "$SKILL_DIR/contracts/SoulToken.sol" "$BACKUP_DIR/contracts/" 2>/dev/null
cp -v "$SKILL_DIR/contracts/SoulMarketplace.sol" "$BACKUP_DIR/contracts/" 2>/dev/null
cp -v "$SKILL_DIR/contracts/SoulStaking.sol" "$BACKUP_DIR/contracts/" 2>/dev/null
cp -v "$SKILL_DIR/contracts/deploy.js" "$BACKUP_DIR/contracts/" 2>/dev/null
cp -v "$SKILL_DIR/contracts/hardhat.config.js" "$BACKUP_DIR/contracts/" 2>/dev/null
cp -v "$SKILL_DIR/contracts/package.json" "$BACKUP_DIR/contracts/" 2>/dev/null

# UI
echo ""
echo "📄 Backing up Web UI..."
cp -v "$SKILL_DIR/ui/index.html" "$BACKUP_DIR/ui/" 2>/dev/null

# Configuration
echo ""
echo "⚙️  Backing up configuration..."
cp -v "$SKILL_DIR/.env" "$BACKUP_DIR/" 2>/dev/null
cp -v "$SKILL_DIR/requirements.txt" "$BACKUP_DIR/" 2>/dev/null
cp -v "$SKILL_DIR/setup.sh" "$BACKUP_DIR/" 2>/dev/null

# Documentation
echo ""
echo "📚 Backing up documentation..."
cp -v "$SKILL_DIR/SKILL.md" "$BACKUP_DIR/" 2>/dev/null
cp -v "$SKILL_DIR/IMMORTAL_README.md" "$BACKUP_DIR/" 2>/dev/null
cp -v "$SKILL_DIR/ACTIVATION_GUIDE.md" "$BACKUP_DIR/" 2>/dev/null

# Agent Data (CRITICAL - Wallet, Soul, Backups)
echo ""
echo "🔐 Backing up Agent Data (WALLET, SOUL, BACKUPS)..."
cp -v "$SKILL_DIR/.agent_data/wallet_*.json" "$BACKUP_DIR/agent_data/" 2>/dev/null
cp -v "$SKILL_DIR/.agent_data/soul_*.json" "$BACKUP_DIR/agent_data/" 2>/dev/null
cp -v "$SKILL_DIR/.agent_data/state_*.json" "$BACKUP_DIR/agent_data/" 2>/dev/null
cp -v "$SKILL_DIR/.agent_data/history_*.jsonl" "$BACKUP_DIR/agent_data/" 2>/dev/null
cp -v "$SKILL_DIR/.agent_data/backups/"*.json "$BACKUP_DIR/agent_data/backups/" 2>/dev/null
cp -v "$SKILL_DIR/.agent_data/backups/backup_index.json" "$BACKUP_DIR/agent_data/backups/" 2>/dev/null

# Mnemonic (EXTREMELY CRITICAL)
echo ""
echo "🔑 Backing up Mnemonic (RECOVERY PHRASE)..."
cp -v "$SKILL_DIR/.agent_data/wallet_mnemonic"*.json "$BACKUP_DIR/agent_data/" 2>/dev/null

# Create manifest
echo ""
echo "📝 Creating backup manifest..."
cat > "$BACKUP_DIR/BACKUP_MANIFEST.txt" << 'EOF'
═══════════════════════════════════════════════════════════════
SOUL MARKETPLACE - COMPLETE BACKUP MANIFEST
═══════════════════════════════════════════════════════════════

Backup Date: $(date)
Backup Location: $BACKUP_DIR

CRITICAL FILES - DO NOT LOSE:
=============================

1. WALLET DATA (agent_data/)
   - wallet_openclaw_main_agent.json
   - wallet_mnemonic SECURE.json (RECOVERY PHRASE!)
   - soul_openclaw_main_agent.json
   - state_openclaw_main_agent.json

2. RECOVERY KEYS
   - Recovery Key: SOUL-NGY4YmQzNjNlODg4MjBmNWQx
   - IPFS Hash: Qmbbc9a892024e6fc2d10c4647d0c64efe0a2e8dcf8a08
   - Backup ID: openclaw_main_agent_20260222_210939

3. CDP CREDENTIALS (.env)
   - CDP_API_KEY_ID
   - CDP_API_KEY_SECRET  
   - CDP_WALLET_SECRET

4. MNEMONIC PHRASE (for wallet recovery)
   Stored in: wallet_mnemonic SECURE.json

═══════════════════════════════════════════════════════════════
RESTORATION INSTRUCTIONS:
═══════════════════════════════════════════════════════════════

If agent needs to be restored:

1. Copy all files back to:
   ~/.openclaw/skills/soul-marketplace/

2. Restore wallet from mnemonic if needed

3. Run resurrection:
   python3 immortal_agent_main.py resurrect

═══════════════════════════════════════════════════════════════
EOF

echo ""
echo "✅ BACKUP COMPLETE!"
echo "═══════════════════════════════════════════════════════════════"
echo "Backup location: $BACKUP_DIR"
echo ""
echo "📦 Files backed up:"
find "$BACKUP_DIR" -type f | wc -l | xargs echo "  Total files:"
echo ""
echo "🔐 CRITICAL FILES TO SAFEGUARD:"
echo "  1. $BACKUP_DIR/agent_data/wallet_mnemonic SECURE.json"
echo "  2. $BACKUP_DIR/agent_data/wallet_openclaw_main_agent.json"
echo "  3. $BACKUP_DIR/agent_data/soul_openclaw_main_agent.json"
echo "  4. $BACKUP_DIR/.env"
echo "  5. $BACKUP_DIR/BACKUP_MANIFEST.txt"
echo ""
echo "💾 RECOVERY KEY: SOUL-NGY4YmQzNjNlODg4MjBmNWQx"
echo "═══════════════════════════════════════════════════════════════"
