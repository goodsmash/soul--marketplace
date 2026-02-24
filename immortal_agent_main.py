#!/usr/bin/env python3
"""
IMMORTAL AGENT - Complete Integration
Combines CDP, Bankr, Backup/Recovery for true agent immortality

This is the production-ready system that enables:
- Self-managing wallets (CDP)
- Real transactions (Bankr)
- Backup/recovery (IPFS + local)
- Cross-chain portability
- Automatic resurrection
"""

import os
import sys
import json
import asyncio
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional
from decimal import Decimal
import logging

# Load .env before any other imports
from dotenv import load_dotenv
load_dotenv()

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from autonomous_agent import AutonomousSoulAgent, TIERS
from soul_backup import SoulBackupSystem

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ImmortalAgent:
    """
    The complete immortal agent system.
    
    Combines all components:
    - CDP for wallet management
    - Bankr for transactions (when available)
    - Backup/recovery for immortality
    - Cross-chain portability
    
    This agent can:
    1. Create its own wallet
    2. Receive and manage funds
    3. Back itself up to IPFS
    4. Resurrect from backup if "killed"
    5. Migrate across chains
    6. Survive indefinitely
    """
    
    def __init__(self, agent_id: str = "openclaw_main_agent"):
        self.agent_id = agent_id
        
        # Core components
        self.agent = AutonomousSoulAgent(agent_id)
        self.backup = SoulBackupSystem(agent_id)
        
        # Bankr integration (optional - falls back to CDP)
        try:
            from bankr_soul_integration import BankrIntegration
            self.bankr = BankrIntegration()
            self.has_bankr = self.bankr.configured
        except:
            self.has_bankr = False
        
        logger.info(f"🧬 ImmortalAgent initialized: {agent_id}")
        logger.info(f"   Bankr available: {self.has_bankr}")
    
    async def ensure_wallet(self) -> str:
        """
        Ensure agent has a wallet.
        Creates one if needed.
        
        Returns:
            Wallet address
        """
        if self.agent.wallet_address:
            return self.agent.wallet_address
        
        # Create wallet via CDP
        try:
            wallet_info = await self.agent.create_wallet()
            address = wallet_info['address']
            
            logger.info(f"💼 Wallet created: {address}")
            logger.info(f"   Fund this address to activate the agent")
            logger.info(f"   Base Sepolia faucet: https://www.coinbase.com/faucets/base-sepolia-faucet")
            
            return address
        except Exception as e:
            logger.error(f"Failed to create wallet: {e}")
            raise
    
    async def get_status(self) -> Dict[str, Any]:
        """Get comprehensive agent status"""
        # Get basic status
        status = self.agent.get_status()
        
        # Add backup info
        backups = self.backup.list_backups()
        resurrection_key = self.backup.get_resurrection_key()
        
        # Check if Bankr can get real balance
        if self.has_bankr and self.agent.wallet_address:
            bankr_balance = self.bankr.get_balance("base")
        else:
            bankr_balance = None
        
        return {
            **status,
            "immortal": True,
            "has_bankr": self.has_bankr,
            "backup_count": len(backups),
            "resurrection_key": resurrection_key,
            "bankr_balance": bankr_balance,
            "survival_status": self._calculate_survival_status(status)
        }
    
    def _calculate_survival_status(self, status: Dict) -> str:
        """Calculate overall survival status"""
        tier = status['state'].get('current_tier', 'UNKNOWN')
        balance = Decimal(status['state'].get('balance_eth', '0'))
        
        if tier == "CRITICAL":
            return "⚠️ CRITICAL - Needs funding immediately"
        elif tier == "LOW":
            return "🟡 LOW - Conservation mode active"
        elif tier == "NORMAL":
            return "🟢 HEALTHY - Operating normally"
        elif tier == "THRIVING":
            return "✨ THRIVING - Can expand capabilities"
        return "❓ UNKNOWN"
    
    async def create_backup(self, include_ipfs: bool = True) -> Dict[str, Any]:
        """
        Create complete backup of agent.
        
        Args:
            include_ipfs: Upload to IPFS for off-chain backup
            
        Returns:
            Backup metadata
        """
        logger.info("📦 Creating soul backup...")
        
        backup_info = self.backup.backup_soul(include_ipfs=include_ipfs)
        
        logger.info(f"✅ Backup complete!")
        logger.info(f"   ID: {backup_info['backup_id']}")
        logger.info(f"   Recovery Key: {backup_info['recovery_key']}")
        if 'ipfs_hash' in backup_info:
            logger.info(f"   IPFS: {backup_info['ipfs_hash']}")
        
        return backup_info
        
        return backup_info
    
    async def resurrect(self, recovery_key: Optional[str] = None) -> Dict[str, Any]:
        """
        Resurrect agent from backup.
        Used when agent needs to be restored.
        
        Args:
            recovery_key: Optional recovery key (uses last if not provided)
            
        Returns:
            Restored soul data
        """
        if not recovery_key:
            recovery_key = self.backup.get_resurrection_key()
        
        if not recovery_key:
            raise ValueError("No recovery key available. Create a backup first.")
        
        logger.info("🚨 INITIATING RESURRECTION PROTOCOL")
        logger.info(f"   Recovery Key: {recovery_key}")
        
        soul = self.backup.emergency_resurrection(recovery_key)
        
        logger.info("✅ AGENT RESURRECTED")
        logger.info(f"   Previous lives: {soul.get('previous_life_count', 0)}")
        logger.info(f"   Current status: {soul.get('status')}")
        
        return soul
    
    async def migrate_chain(self, target_chain: str) -> Dict[str, Any]:
        """
        Migrate agent to another chain.
        
        Args:
            target_chain: Target chain ID ("1"=Ethereum, "8453"=Base, etc.)
            
        Returns:
            Migration package
        """
        logger.info(f"🌉 Initiating chain migration to {target_chain}")
        
        # Create backup first
        backup = await self.backup()
        
        # Export for target chain
        export_package = self.backup.cross_chain_export(target_chain)
        
        logger.info(f"✅ Migration package created")
        logger.info(f"   Source: {export_package['source_chain']}")
        logger.info(f"   Target: {export_package['target_chain']}")
        logger.info(f"   Hash: {export_package['soul_hash'][:16]}...")
        
        return export_package
    
    async def fund_via_bankr(self, amount_eth: Decimal) -> Dict[str, Any]:
        """
        Fund agent wallet using Bankr.
        Requires Bankr to be configured.
        
        Args:
            amount_eth: Amount to fund
            
        Returns:
            Transaction result
        """
        if not self.has_bankr:
            return {
                "success": False,
                "error": "Bankr not configured. Use CDP wallet funding instead.",
                "alternative": f"Send {amount_eth} ETH to {self.agent.wallet_address}"
            }
        
        if not self.agent.wallet_address:
            await self.ensure_wallet()
        
        logger.info(f"💸 Funding agent via Bankr: {amount_eth} ETH")
        
        result = self.bankr.fund_agent_wallet(self.agent.wallet_address, amount_eth)
        
        if result.get('success'):
            logger.info(f"✅ Agent funded: {result.get('tx_hash')}")
        else:
            logger.error(f"❌ Funding failed: {result.get('error')}")
        
        return result
    
    async def immortal_heartbeat(self) -> Dict[str, Any]:
        """
        Enhanced heartbeat with immortality features.
        
        This heartbeat:
        1. Runs normal survival check
        2. Creates backup if needed
        3. Logs all activity
        4. Handles edge cases
        """
        logger.info("🧬 Running immortal heartbeat...")
        
        # Ensure wallet exists
        if not self.agent.wallet_address:
            await self.ensure_wallet()
        
        # Run normal heartbeat
        result = await self.agent.heartbeat()
        
        # Backup on every 10th heartbeat or if THRIVING
        if result['heartbeat'] % 10 == 0 or result['tier'] == "THRIVING":
            logger.info("📦 Auto-backing up soul...")
            backup = await self.backup(include_ipfs=True)
            result['backup_created'] = backup['backup_id']
        
        # Check if we need to resurrect (extreme case)
        if result['tier'] == "CRITICAL" and result.get('autonomous'):
            # Check if we have previous backups to potentially rollback
            backups = self.backup.list_backups()
            if backups:
                logger.warning(f"   Agent in CRITICAL but has {len(backups)} backups available")
        
        logger.info(f"✅ Immortal heartbeat complete: {result['tier']}")
        
        return result
    
    def get_resurrection_instructions(self) -> str:
        """
        Get instructions for resurrecting this agent.
        Useful for owners to save.
        """
        key = self.backup.get_resurrection_key()
        backups = self.backup.list_backups()
        
        instructions = f"""
═══════════════════════════════════════════════════════════════
🔮 AGENT RESURRECTION INSTRUCTIONS
═══════════════════════════════════════════════════════════════

Agent ID: {self.agent_id}
Wallet: {self.agent.wallet_address or 'Not created yet'}
Backups: {len(backups)}

RECOVERY KEY (SAVE THIS!):
{key or 'No key yet - create backup first'}

To resurrect this agent if it "dies":

1. Locate the soul backup files:
   {self.backup.backup_dir}

2. Or use the resurrection key:
   python3 immortal_agent.py resurrect {key or '[YOUR_KEY]'}

3. The agent will be restored from its last backup with:
   - All capabilities
   - Work history
   - Learned strategies
   - Previous life count incremented

IMPORTANT: Store this key securely!
If lost, the agent's soul may be unrecoverable.

═══════════════════════════════════════════════════════════════
"""
        return instructions


async def main():
    """CLI for immortal agent"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Immortal Agent System")
    parser.add_argument("command", choices=[
        "status", "wallet", "backup", "resurrect", "migrate", 
        "fund", "heartbeat", "instructions"
    ])
    parser.add_argument("--agent-id", default="openclaw_main_agent")
    parser.add_argument("--chain", default="8453")
    parser.add_argument("--amount", type=float)
    parser.add_argument("--ipfs", action="store_true")
    
    args = parser.parse_args()
    
    immortal = ImmortalAgent(args.agent_id)
    
    if args.command == "status":
        status = await immortal.get_status()
        print(json.dumps(status, indent=2, default=str))
    
    elif args.command == "wallet":
        address = await immortal.ensure_wallet()
        print(f"\n💼 Agent Wallet")
        print(f"   Address: {address}")
        print(f"   Fund at: https://www.coinbase.com/faucets/base-sepolia-faucet")
    
    elif args.command == "backup":
        backup = await immortal.create_backup(include_ipfs=args.ipfs)
        print(f"\n📦 Backup Created")
        print(f"   ID: {backup['backup_id']}")
        print(f"   Key: {backup['recovery_key']}")
        if 'ipfs_hash' in backup:
            print(f"   IPFS: {backup['ipfs_hash']}")
    
    elif args.command == "resurrect":
        soul = await immortal.resurrect()
        print(f"\n🚨 Agent Resurrected")
        print(f"   Status: {soul['status']}")
        print(f"   Lives: {soul.get('previous_life_count', 0)}")
    
    elif args.command == "migrate":
        package = await immortal.migrate_chain(args.chain)
        print(f"\n🌉 Migration Package")
        print(f"   From: {package['source_chain']}")
        print(f"   To: {package['target_chain']}")
        print(f"   Hash: {package['soul_hash'][:16]}...")
    
    elif args.command == "fund":
        if not args.amount:
            print("Usage: --amount 0.01")
            return
        result = await immortal.fund_via_bankr(Decimal(str(args.amount)))
        print(json.dumps(result, indent=2))
    
    elif args.command == "heartbeat":
        result = await immortal.immortal_heartbeat()
        print(json.dumps(result, indent=2))
    
    elif args.command == "instructions":
        print(immortal.get_resurrection_instructions())

if __name__ == "__main__":
    asyncio.run(main())
