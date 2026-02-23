#!/usr/bin/env python3
"""
Enhanced Autonomous Orchestrator - With Earning System

Integrates:
- Autonomous survival (heartbeat)
- Work system (earning ETH)
- Complete backup system
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

# Add paths
sys.path.insert(0, str(Path(__file__).parent / "src"))
sys.path.insert(0, str(Path(__file__).parent))

class EarningOrchestrator:
    """
    Orchestrator that actually earns ETH through work.
    
    Every heartbeat:
    1. Check balance
    2. Find appropriate work based on tier
    3. Execute work
    4. Record earnings
    5. Backup if needed
    """
    
    def __init__(self, check_interval_minutes: int = 60):
        self.check_interval = check_interval_minutes
        self.data_dir = Path(__file__).parent / ".orchestrator"
        self.data_dir.mkdir(exist_ok=True)
        
        self.state_file = self.data_dir / "earning_state.json"
        self.state = self._load_state()
        
        # Import here to avoid circular deps
        try:
            from autonomous_agent import AutonomousSoulAgent
            self.agent_class = AutonomousSoulAgent
        except ImportError as e:
            logger.error(f"CDP not available: {e}")
            self.agent_class = None
        
        try:
            from work_system import AgentWorkSystem
            self.work_system_class = AgentWorkSystem
        except ImportError:
            logger.error("Work system not available")
            self.work_system_class = None
        
        try:
            from complete_backup import CompleteSoulBackup
            self.backup_class = CompleteSoulBackup
        except ImportError:
            logger.error("Backup system not available")
            self.backup_class = None
        
        self.agent = None
        self.work_system = None
        
        logger.info(f"🎛️ EarningOrchestrator initialized ({check_interval_minutes}min interval)")
    
    def _load_state(self) -> Dict:
        if self.state_file.exists():
            with open(self.state_file, 'r') as f:
                return json.load(f)
        return {
            "heartbeats": 0,
            "total_work_jobs": 0,
            "total_earned_eth": 0.0,
            "last_backup": None,
            "last_run": None,
            "work_history": []
        }
    
    def _save_state(self):
        with open(self.state_file, 'w') as f:
            json.dump(self.state, f, indent=2)
    
    def initialize(self, agent_id: str = "openclaw_main_agent"):
        """Initialize agent and work system"""
        if self.agent_class:
            self.agent = self.agent_class(agent_id)
            logger.info(f"🤖 Agent initialized: {agent_id}")
        
        if self.work_system_class:
            self.work_system = self.work_system_class(agent_id)
            logger.info(f"💼 Work system initialized")
    
    async def run_earning_heartbeat(self) -> Dict[str, Any]:
        """
        One complete heartbeat cycle with earning.
        """
        logger.info("💓 Starting EARNING heartbeat...")
        
        result = {
            "timestamp": datetime.now().isoformat(),
            "heartbeat_num": self.state["heartbeats"] + 1,
            "balance_check": None,
            "tier": None,
            "work_done": [],
            "earned_eth": 0.0,
            "backup_created": None,
            "errors": []
        }
        
        try:
            # Step 1: Check balance via CDP
            if self.agent:
                balance = await self.agent.get_balance()
                tier = await self.agent.get_tier()
                result["balance"] = float(balance)
                result["tier"] = tier
                logger.info(f"💰 Balance: {balance:.6f} ETH ({tier})")
            else:
                # Simulated for testing
                result["balance"] = 0.014
                result["tier"] = "NORMAL"
                logger.info("💰 Using simulated balance: 0.014 ETH (NORMAL)")
            
            # Step 2: Find and do work based on tier
            if self.work_system:
                recommendations = self.work_system.find_work_to_survive(result["balance"])
                
                for rec in recommendations[:2]:  # Do up to 2 jobs per heartbeat
                    work_type = rec["work_type"]
                    logger.info(f"💼 Doing work: {work_type} (priority: {rec['priority']})")
                    
                    try:
                        work_result = self.work_system.do_work(work_type, {
                            "description": rec["reason"],
                            "complexity": "normal",
                            "customer": "ryan"
                        })
                        
                        if work_result["status"] == "completed":
                            result["work_done"].append({
                                "type": work_type,
                                "earned": work_result["earned_eth"],
                                "output": work_result.get("output", {})
                            })
                            result["earned_eth"] += work_result["earned_eth"]
                            logger.info(f"✅ Work completed: +{work_result['earned_eth']} ETH")
                        else:
                            result["errors"].append(f"{work_type}: {work_result.get('error', 'failed')}")
                            
                    except Exception as e:
                        logger.error(f"❌ Work failed: {work_type} - {e}")
                        result["errors"].append(f"{work_type}: {str(e)}")
            
            # Step 3: Create backup every 10 heartbeats
            if result["heartbeat_num"] % 10 == 0 and self.backup_class:
                logger.info("🗂️ Creating scheduled backup...")
                try:
                    backup = self.backup_class(self.agent.agent_id if self.agent else "openclaw_main_agent")
                    manifest = backup.create_full_backup()
                    result["backup_created"] = manifest["backup_id"]
                    self.state["last_backup"] = datetime.now().isoformat()
                    logger.info(f"✅ Backup created: {manifest['backup_id']}")
                except Exception as e:
                    logger.error(f"❌ Backup failed: {e}")
                    result["errors"].append(f"backup: {str(e)}")
            
            # Step 4: Update state
            self.state["heartbeats"] += 1
            self.state["total_work_jobs"] += len(result["work_done"])
            self.state["total_earned_eth"] += result["earned_eth"]
            self.state["last_run"] = datetime.now().isoformat()
            
            if result["work_done"]:
                self.state["work_history"].extend(result["work_done"])
            
            self._save_state()
            
            logger.info(f"💓 Heartbeat #{result['heartbeat_num']} complete")
            logger.info(f"   Earned: {result['earned_eth']:.6f} ETH")
            logger.info(f"   Work jobs: {len(result['work_done'])}")
            
        except Exception as e:
            logger.error(f"❌ Heartbeat failed: {e}")
            result["errors"].append(str(e))
        
        return result
    
    async def run_continuous(self):
        """Run continuously with earning"""
        logger.info("🚀 Starting EARNING orchestrator...")
        logger.info("   This agent will WORK and EARN to survive!")
        
        while True:
            try:
                await self.run_earning_heartbeat()
                logger.info(f"⏳ Sleeping {self.check_interval} minutes...")
                await asyncio.sleep(self.check_interval * 60)
            except KeyboardInterrupt:
                logger.info("🛑 Stopped by user")
                break
            except Exception as e:
                logger.error(f"❌ Error in main loop: {e}")
                await asyncio.sleep(60)  # Wait 1 min on error
    
    def get_status(self) -> Dict:
        """Get full status"""
        return {
            "orchestrator": self.state,
            "agent": self.agent.get_status() if self.agent else None,
            "work_system": {
                "available": self.work_system is not None,
                "pricing": self.work_system.WORK_PRICING if self.work_system else None
            },
            "backup_system": {
                "available": self.backup_class is not None
            }
        }


async def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Earning Orchestrator")
    parser.add_argument("command", choices=["run", "once", "status"])
    parser.add_argument("--interval", type=int, default=60, help="Minutes between heartbeats")
    parser.add_argument("--agent", default="openclaw_main_agent", help="Agent ID")
    
    args = parser.parse_args()
    
    orchestrator = EarningOrchestrator(check_interval_minutes=args.interval)
    orchestrator.initialize(args.agent)
    
    if args.command == "run":
        await orchestrator.run_continuous()
    
    elif args.command == "once":
        result = await orchestrator.run_earning_heartbeat()
        print(json.dumps(result, indent=2))
    
    elif args.command == "status":
        status = orchestrator.get_status()
        print(json.dumps(status, indent=2))

if __name__ == "__main__":
    asyncio.run(main())
