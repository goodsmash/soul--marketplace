#!/usr/bin/env python3
"""
Autonomous Orchestrator - 24/7 Agent Survival System
Runs continuously, makes decisions, executes transactions
"""

import os
import sys
import json
import time
import asyncio
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('/tmp/soul_orchestrator.log')
    ]
)
logger = logging.getLogger(__name__)

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

try:
    from autonomous_agent import AutonomousSoulAgent
except ImportError as e:
    logger.error(f"Failed to import autonomous_agent: {e}")
    logger.error("Install dependencies: pip install cdp-sdk")
    raise

class AutonomousOrchestrator:
    """
    24/7 Orchestrator for agent survival
    
    Responsibilities:
    - Run heartbeats on schedule
    - Execute autonomous decisions
    - Handle errors and recovery
    - Log all activity
    - Manage multiple agents
    """
    
    def __init__(self, check_interval_minutes: int = 60):
        self.check_interval = check_interval_minutes * 60  # Convert to seconds
        self.agents: Dict[str, AutonomousSoulAgent] = {}
        self.running = False
        self.data_dir = Path(__file__).parent / ".orchestrator"
        self.data_dir.mkdir(exist_ok=True)
        
        # State file
        self.state_file = self.data_dir / "orchestrator_state.json"
        self.state = self._load_state()
        
        logger.info(f"🎛️ Orchestrator initialized (check interval: {check_interval_minutes}min)")
    
    def _load_state(self) -> Dict[str, Any]:
        """Load orchestrator state"""
        if self.state_file.exists():
            with open(self.state_file, 'r') as f:
                return json.load(f)
        return {
            "started_at": None,
            "total_heartbeats": 0,
            "last_run": None,
            "errors": [],
            "agents": []
        }
    
    def _save_state(self):
        """Persist state"""
        with open(self.state_file, 'w') as f:
            json.dump(self.state, f, indent=2)
    
    def register_agent(self, agent_id: str) -> AutonomousSoulAgent:
        """Register an agent for management"""
        agent = AutonomousSoulAgent(agent_id)
        self.agents[agent_id] = agent
        
        if agent_id not in self.state["agents"]:
            self.state["agents"].append(agent_id)
            self._save_state()
        
        logger.info(f"✅ Agent registered: {agent_id}")
        return agent
    
    async def run_single_heartbeat(self, agent_id: str) -> Dict[str, Any]:
        """Run heartbeat for a single agent"""
        agent = self.agents.get(agent_id)
        if not agent:
            raise ValueError(f"Agent not found: {agent_id}")
        
        try:
            result = await agent.heartbeat()
            self.state["total_heartbeats"] += 1
            self._save_state()
            
            logger.info(f"✅ Heartbeat completed for {agent_id}")
            return result
            
        except Exception as e:
            error_info = {
                "time": datetime.now().isoformat(),
                "agent": agent_id,
                "error": str(e)
            }
            self.state["errors"].append(error_info)
            self._save_state()
            
            logger.error(f"❌ Heartbeat failed for {agent_id}: {e}")
            raise
    
    async def run_all_heartbeats(self) -> Dict[str, Any]:
        """Run heartbeats for all registered agents"""
        results = {}
        
        for agent_id in self.agents:
            try:
                result = await self.run_single_heartbeat(agent_id)
                results[agent_id] = {
                    "status": "success",
                    "data": result
                }
            except Exception as e:
                results[agent_id] = {
                    "status": "error",
                    "error": str(e)
                }
        
        self.state["last_run"] = datetime.now().isoformat()
        self._save_state()
        
        return results
    
    async def run_continuous(self):
        """Run orchestrator continuously (24/7)"""
        self.running = True
        self.state["started_at"] = datetime.now().isoformat()
        self._save_state()
        
        logger.info("🚀 Starting continuous operation...")
        logger.info(f"   Agents: {list(self.agents.keys())}")
        logger.info(f"   Interval: {self.check_interval}s")
        
        while self.running:
            try:
                logger.info("⏰ Running scheduled heartbeats...")
                results = await self.run_all_heartbeats()
                
                # Log summary
                success_count = sum(1 for r in results.values() if r.get("status") == "success")
                error_count = len(results) - success_count
                logger.info(f"📊 Summary: {success_count} success, {error_count} errors")
                
                # Check for CRITICAL agents and alert
                for agent_id, result in results.items():
                    if result.get("status") == "success":
                        tier = result.get("data", {}).get("tier")
                        if tier == "CRITICAL":
                            logger.critical(f"🚨 {agent_id} IS IN CRITICAL STATE!")
                            # Could send alert via message/telegram here
                
            except Exception as e:
                logger.error(f"❌ Orchestrator error: {e}")
            
            # Wait for next interval
            logger.info(f"⏳ Sleeping for {self.check_interval}s...")
            await asyncio.sleep(self.check_interval)
    
    def stop(self):
        """Stop continuous operation"""
        self.running = False
        logger.info("🛑 Orchestrator stopped")
    
    def get_status(self) -> Dict[str, Any]:
        """Get full orchestrator status"""
        agent_statuses = {}
        for agent_id, agent in self.agents.items():
            agent_statuses[agent_id] = agent.get_status()
        
        return {
            "orchestrator": self.state,
            "agents": agent_statuses,
            "running": self.running,
            "interval_seconds": self.check_interval
        }


# CLI Commands
def print_usage():
    print("""
Soul Marketplace Autonomous Orchestrator

Usage:
  python orchestrator.py [command] [options]

Commands:
  run          Start continuous 24/7 operation
  once         Run single heartbeat cycle
  status       Show current status
  register     Register a new agent
  enable-auto  Enable autonomous mode for agent
  disable-auto Disable autonomous mode for agent
  fund         Show/create agent wallet for funding

Examples:
  python orchestrator.py run
  python orchestrator.py once
  python orchestrator.py status
  python orchestrator.py register my_agent
  python orchestrator.py enable-auto my_agent
  python orchestrator.py fund my_agent
    """)

async def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Soul Marketplace Orchestrator")
    parser.add_argument("command", choices=["run", "once", "status", "register", "enable-auto", "disable-auto", "fund"])
    parser.add_argument("agent_id", nargs="?", default="openclaw_main_agent")
    parser.add_argument("--interval", type=int, default=60, help="Check interval in minutes")
    
    args = parser.parse_args()
    
    orchestrator = AutonomousOrchestrator(check_interval_minutes=args.interval)
    
    if args.command == "run":
        # Register agent and start
        orchestrator.register_agent(args.agent_id)
        
        try:
            await orchestrator.run_continuous()
        except KeyboardInterrupt:
            orchestrator.stop()
            print("\n👋 Orchestrator stopped by user")
    
    elif args.command == "once":
        orchestrator.register_agent(args.agent_id)
        results = await orchestrator.run_all_heartbeats()
        print(json.dumps(results, indent=2))
    
    elif args.command == "status":
        if args.agent_id:
            orchestrator.register_agent(args.agent_id)
        status = orchestrator.get_status()
        print(json.dumps(status, indent=2))
    
    elif args.command == "register":
        agent = orchestrator.register_agent(args.agent_id)
        print(f"✅ Agent registered: {args.agent_id}")
        print(f"   Data directory: {agent.data_dir}")
    
    elif args.command == "enable-auto":
        agent = orchestrator.register_agent(args.agent_id)
        agent.enable_autonomous_mode()
        print(f"🤖 Autonomous mode enabled for {args.agent_id}")
    
    elif args.command == "disable-auto":
        agent = orchestrator.register_agent(args.agent_id)
        agent.disable_autonomous_mode()
        print(f"👤 Autonomous mode disabled for {args.agent_id}")
    
    elif args.command == "fund" or args.command == "create-wallet":
        agent = orchestrator.register_agent(args.agent_id)
        try:
            if agent.wallet_address:
                print(f"💼 Agent Wallet: {args.agent_id}")
                print(f"   Address: {agent.wallet_address}")
                print(f"   Status: Already exists")
            else:
                print(f"💼 Creating wallet for: {args.agent_id}")
                wallet_info = agent.create_wallet()
                print(f"   Address: {wallet_info['address']}")
                print(f"   Status: New wallet created")
            
            print(f"\n   Network: Base Sepolia (84532)")
            print(f"   Faucet: https://www.coinbase.com/faucets/base-sepolia-faucet")
            print(f"   Wallet file: {agent.wallet_file}")
        except ValueError as e:
            print(f"❌ Error: {e}")
            print("   Make sure CDP_API_KEY_ID and CDP_API_KEY_SECRET are set in .env")

if __name__ == "__main__":
    asyncio.run(main())
