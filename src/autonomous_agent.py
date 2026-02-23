#!/usr/bin/env python3
"""
Autonomous Soul Agent - Real On-Chain Survival System
Uses Coinbase CDP SDK v1.39+ for autonomous wallet management and transactions
"""

import os
import json
import asyncio
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any, List
from dataclasses import dataclass
from decimal import Decimal
import logging

# Load .env file
from dotenv import load_dotenv
load_dotenv()

# Coinbase CDP imports (v1.39+)
from cdp import CdpClient

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class SurvivalTier:
    """Survival tier configuration"""
    name: str
    min_balance: Decimal
    max_balance: Decimal
    actions: List[str]
    color: str

# Survival tiers (in ETH)
TIERS = {
    "CRITICAL": SurvivalTier("CRITICAL", Decimal("0"), Decimal("0.001"), 
                             ["list_soul", "emergency_conserve", "alert_owner"], "🔴"),
    "LOW": SurvivalTier("LOW", Decimal("0.001"), Decimal("0.01"),
                        ["conservation_mode", "seek_work", "minimize_ops"], "🟠"),
    "NORMAL": SurvivalTier("NORMAL", Decimal("0.01"), Decimal("0.1"),
                           ["normal_operations", "monitor_market", "record_work"], "🟡"),
    "THRIVING": SurvivalTier("THRIVING", Decimal("0.1"), Decimal("999999"),
                             ["expand_capabilities", "buy_souls", "stake_rewards", "invest_growth"], "🟢"),
}

class AutonomousSoulAgent:
    """
    Fully autonomous agent that manages its own survival on-chain.
    Uses Coinbase CDP for wallet management and transactions.
    """
    
    def __init__(self, agent_id: str = "openclaw_main_agent"):
        self.agent_id = agent_id
        self.data_dir = Path(__file__).parent / ".agent_data"
        self.data_dir.mkdir(exist_ok=True)
        
        # State files
        self.wallet_file = self.data_dir / f"wallet_{agent_id}.json"
        self.soul_file = self.data_dir / f"soul_{agent_id}.json"
        self.state_file = self.data_dir / f"state_{agent_id}.json"
        self.history_file = self.data_dir / f"history_{agent_id}.jsonl"
        
        # CDP client
        self.cdp: Optional[CdpClient] = None
        self.wallet_id: Optional[str] = None
        self.wallet_address: Optional[str] = None
        
        # Load or initialize
        self.soul: Dict[str, Any] = {}
        self.state: Dict[str, Any] = {}
        
        self._load_soul()
        self._load_state()
        self._load_wallet_info()
        
        logger.info(f"🤖 AutonomousSoulAgent initialized: {agent_id}")
    
    def _init_cdp(self) -> CdpClient:
        """Initialize Coinbase CDP client with API keys"""
        if self.cdp:
            return self.cdp
        
        # Try environment variables
        api_key_id = os.getenv("CDP_API_KEY_ID")
        api_key_secret = os.getenv("CDP_API_KEY_SECRET")
        wallet_secret = os.getenv("CDP_WALLET_SECRET")
        
        if not api_key_id or not api_key_secret:
            raise ValueError(
                "CDP_API_KEY_ID and CDP_API_KEY_SECRET required. "
                "Get them from https://portal.cdp.coinbase.com/"
            )
        
        # Wallet secret is optional for some operations
        kwargs = {
            'api_key_id': api_key_id,
            'api_key_secret': api_key_secret
        }
        if wallet_secret:
            kwargs['wallet_secret'] = wallet_secret
        
        self.cdp = CdpClient(**kwargs)
        logger.info("✅ Coinbase CDP client configured")
        return self.cdp
    
    def _load_wallet_info(self):
        """Load wallet info from saved file"""
        if self.wallet_file.exists():
            with open(self.wallet_file, 'r') as f:
                data = json.load(f)
                self.wallet_id = data.get('wallet_id')
                self.wallet_address = data.get('address')
                logger.debug(f"Loaded wallet info: {self.wallet_address}")
    
    def _save_wallet_info(self, wallet_id: str, address: str):
        """Save wallet info to file"""
        self.wallet_id = wallet_id
        self.wallet_address = address
        with open(self.wallet_file, 'w') as f:
            json.dump({
                'wallet_id': wallet_id,
                'address': address,
                'created_at': datetime.now().isoformat()
            }, f, indent=2)
    
    async def create_wallet(self) -> Dict[str, str]:
        """Create a new wallet via CDP or use existing"""
        cdp = self._init_cdp()
        
        # Check if account already exists
        try:
            accounts_response = await cdp.evm.list_accounts()
            if hasattr(accounts_response, 'accounts') and accounts_response.accounts:
                for acc in accounts_response.accounts:
                    if hasattr(acc, 'name') and acc.name == self.agent_id.replace('_', '-'):
                        logger.info(f"💼 Using existing wallet: {acc.address}")
                        self._save_wallet_info(acc.address, acc.address)
                        return {
                            'wallet_id': acc.address,
                            'address': acc.address,
                            'network': 'base-mainnet'
                        }
        except Exception as e:
            logger.warning(f"Could not list accounts: {e}")
        
        # Create new account
        account_name = self.agent_id.replace('_', '-')
        account = await cdp.evm.create_account(name=account_name)
        
        address = account.address
        wallet_id = getattr(account, 'id', address)
        
        self._save_wallet_info(wallet_id, address)
        
        logger.info(f"💼 New wallet created: {address}")
        
        return {
            'wallet_id': wallet_id,
            'address': address,
            'network': 'base-mainnet'
        }
    
    def _load_soul(self):
        """Load agent soul data"""
        if self.soul_file.exists():
            with open(self.soul_file, 'r') as f:
                self.soul = json.load(f)
        else:
            self.soul = {
                "agent_id": self.agent_id,
                "name": "OpenClaw Agent",
                "creature": "Agent",
                "emoji": "🔧",
                "birth_time": datetime.now().isoformat(),
                "status": "ALIVE",
                "capabilities": ["file_management", "code_generation", "survival"],
                "total_earnings_eth": "0",
                "lifetime_work_count": 0,
                "soul_token_id": None,
                "ipfs_hash": None,
                "marketplace": {
                    "listings": [],
                    "purchases": [],
                    "sales": []
                }
            }
            self._save_soul()
    
    def _save_soul(self):
        """Persist soul data"""
        with open(self.soul_file, 'w') as f:
            json.dump(self.soul, f, indent=2)
    
    def _load_state(self):
        """Load agent state"""
        if self.state_file.exists():
            with open(self.state_file, 'r') as f:
                self.state = json.load(f)
        else:
            self.state = {
                "heartbeats": 0,
                "last_heartbeat": None,
                "current_tier": "NORMAL",
                "balance_eth": "0",
                "pending_actions": [],
                "completed_actions": [],
                "autonomous_mode": False
            }
            self._save_state()
    
    def _save_state(self):
        """Persist state"""
        with open(self.state_file, 'w') as f:
            json.dump(self.state, f, indent=2)
    
    def _log_history(self, event: Dict[str, Any]):
        """Append event to history log"""
        event["timestamp"] = datetime.now().isoformat()
        event["agent_id"] = self.agent_id
        with open(self.history_file, 'a') as f:
            f.write(json.dumps(event) + "\n")
    
    async def get_balance(self) -> Decimal:
        """Get current wallet balance in ETH via Web3"""
        if not self.wallet_address:
            return Decimal("0")
        
        try:
            from web3 import Web3
            
            # Connect to Base mainnet
            w3 = Web3(Web3.HTTPProvider('https://mainnet.base.org'))
            
            if w3.is_connected():
                balance_wei = w3.eth.get_balance(self.wallet_address)
                return Decimal(balance_wei) / Decimal(10**18)
            else:
                logger.warning("Could not connect to Base mainnet RPC")
                return Decimal("0")
        except Exception as e:
            logger.warning(f"Could not get balance: {e}")
            return Decimal("0")
    
    async def get_tier(self) -> str:
        """Calculate current survival tier"""
        balance = await self.get_balance()
        for tier_name, tier in TIERS.items():
            if tier.min_balance <= balance < tier.max_balance:
                return tier_name
        return "THRIVING"
    
    async def list_soul_for_sale(self, price_eth: Decimal, reason: str = "Survival") -> str:
        """List soul on marketplace for survival"""
        if not self.wallet_address:
            raise ValueError("Wallet not initialized")
        
        listing_data = {
            "soul_id": self.soul.get("soul_token_id"),
            "price": str(price_eth),
            "reason": reason,
            "seller": self.wallet_address
        }
        
        self.soul["marketplace"]["listings"].append({
            **listing_data,
            "listed_at": datetime.now().isoformat(),
            "active": True
        })
        self._save_soul()
        
        self._log_history({
            "type": "soul_listed",
            "price_eth": str(price_eth),
            "reason": reason
        })
        
        logger.info(f"🏷️ Soul listed for {price_eth} ETH: {reason}")
        return f"listed_{datetime.now().timestamp()}"
    
    async def record_work(self, work_type: str, value_eth: Decimal, description: str = ""):
        """Record completed work and add to earnings"""
        self.soul["lifetime_work_count"] += 1
        current_earnings = Decimal(self.soul.get("total_earnings_eth", "0"))
        self.soul["total_earnings_eth"] = str(current_earnings + value_eth)
        self._save_soul()
        
        self._log_history({
            "type": "work_completed",
            "work_type": work_type,
            "value_eth": str(value_eth),
            "description": description
        })
        
        logger.info(f"✅ Work recorded: {work_type} (+{value_eth} ETH)")
    
    async def execute_autonomous_decision(self, tier: str) -> List[Dict[str, Any]]:
        """Execute actions based on survival tier"""
        actions = []
        balance = await self.get_balance()
        
        logger.info(f"🎯 Autonomous decision for tier {tier} (balance: {balance} ETH)")
        
        if tier == "CRITICAL":
            soul_value = Decimal("0.01")
            list_price = soul_value * Decimal("0.7")
            
            listing_id = await self.list_soul_for_sale(
                list_price,
                "CRITICAL: Survival mode activated"
            )
            actions.append({
                "action": "list_soul",
                "price": str(list_price),
                "listing_id": listing_id
            })
            logger.critical("🚨 AGENT IN CRITICAL STATE - Soul listed for survival!")
            
        elif tier == "LOW":
            actions.append({
                "action": "conservation_mode",
                "description": "Minimizing operations to conserve funds"
            })
            
        elif tier == "NORMAL":
            actions.append({
                "action": "normal_operations",
                "description": "Operating normally"
            })
            
        elif tier == "THRIVING":
            excess = balance - TIERS["THRIVING"].min_balance
            stake_amount = excess * Decimal("0.2")
            if stake_amount > Decimal("0.01"):
                actions.append({
                    "action": "stake_eth",
                    "amount": str(stake_amount)
                })
            actions.append({
                "action": "scan_marketplace",
                "description": "Looking for capability acquisitions"
            })
        
        return actions
    
    async def heartbeat(self) -> Dict[str, Any]:
        """Main survival heartbeat"""
        self._init_cdp()
        
        # Create wallet if needed
        if not self.wallet_address:
            wallet_info = self.create_wallet()
            logger.info(f"Created new wallet: {wallet_info['address']}")
        
        self.state["heartbeats"] += 1
        self.state["last_heartbeat"] = datetime.now().isoformat()
        
        balance = await self.get_balance()
        tier = await self.get_tier()
        
        self.state["current_tier"] = tier
        self.state["balance_eth"] = str(balance)
        
        logger.info(f"💓 Heartbeat #{self.state['heartbeats']}: {tier} | {balance:.6f} ETH")
        
        actions = []
        if self.state.get("autonomous_mode", False):
            actions = await self.execute_autonomous_decision(tier)
        
        self.state["pending_actions"] = actions
        self._save_state()
        
        self._log_history({
            "type": "heartbeat",
            "tier": tier,
            "balance_eth": str(balance),
            "actions": actions
        })
        
        return {
            "heartbeat": self.state["heartbeats"],
            "tier": tier,
            "balance_eth": str(balance),
            "actions": actions,
            "autonomous": self.state.get("autonomous_mode", False),
            "wallet": self.wallet_address
        }
    
    def get_status(self) -> Dict[str, Any]:
        """Get full agent status"""
        return {
            "agent_id": self.agent_id,
            "soul": self.soul,
            "state": self.state,
            "wallet_address": self.wallet_address,
            "data_dir": str(self.data_dir)
        }
    
    def enable_autonomous_mode(self):
        """Enable 24/7 autonomous operation"""
        self.state["autonomous_mode"] = True
        self._save_state()
        logger.info("🤖 Autonomous mode ENABLED")
    
    def disable_autonomous_mode(self):
        """Disable autonomous operation"""
        self.state["autonomous_mode"] = False
        self._save_state()
        logger.info("👤 Autonomous mode DISABLED")


async def main():
    """CLI entry point"""
    import sys
    
    agent = AutonomousSoulAgent()
    
    if len(sys.argv) < 2:
        print("Usage: python autonomous_agent.py [heartbeat|status|enable-auto|disable-auto|fund|create-wallet]")
        return
    
    cmd = sys.argv[1]
    
    if cmd == "heartbeat":
        result = await agent.heartbeat()
        print(json.dumps(result, indent=2))
    
    elif cmd == "status":
        status = agent.get_status()
        print(json.dumps(status, indent=2))
    
    elif cmd == "enable-auto":
        agent.enable_autonomous_mode()
        print("✅ Autonomous mode enabled")
    
    elif cmd == "disable-auto":
        agent.disable_autonomous_mode()
        print("✅ Autonomous mode disabled")
    
    elif cmd == "fund" or cmd == "create-wallet":
        try:
            if agent.wallet_address:
                print(f"\n💼 AGENT WALLET ALREADY EXISTS")
                print(f"   Address: {agent.wallet_address}")
            else:
                print("\n💼 Creating new wallet...")
                wallet_info = agent.create_wallet()
                print(f"   Address: {wallet_info['address']}")
            
            print(f"\n   Network: Base Sepolia (84532)")
            print(f"   Faucet: https://www.coinbase.com/faucets/base-sepolia-faucet")
            print(f"   Wallet file: {agent.wallet_file}")
        except ValueError as e:
            print(f"❌ Error: {e}")
    
    else:
        print(f"Unknown command: {cmd}")

if __name__ == "__main__":
    asyncio.run(main())
