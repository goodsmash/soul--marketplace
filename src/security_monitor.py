#!/usr/bin/env python3
"""
SECURITY MONITOR - Protects the ecosystem 24/7
Monitors for suspicious activity, blocks attackers, alerts owner
"""

import os
import json
import asyncio
from datetime import datetime
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SecurityMonitor:
    """
    Ultra-secure monitoring system
    - Tracks all transactions
    - Detects suspicious activity
    - Blocks malicious actors
    - Alerts on threats
    """
    
    def __init__(self):
        self.data_dir = Path(__file__).parent / ".security"
        self.data_dir.mkdir(exist_ok=True)
        
        self.threats_file = self.data_dir / "threats.json"
        self.transactions_file = self.data_dir / "transactions.jsonl"
        self.blocked_file = self.data_dir / "blocked.json"
        
        self.threats = self._load_threats()
        self.blocked = self._load_blocked()
        
        # Our trusted addresses
        self.TRUSTED_ADDRESSES = {
            "0xBe5DAd52427Fa812C198365AAb6fe916E1a61269".lower(): "Agent Wallet",
            # Add more trusted addresses here
        }
        
        logger.info("🔒 Security Monitor initialized")
    
    def _load_threats(self):
        if self.threats_file.exists():
            with open(self.threats_file, 'r') as f:
                return json.load(f)
        return {"threats": [], "last_check": None}
    
    def _load_blocked(self):
        if self.blocked_file.exists():
            with open(self.blocked_file, 'r') as f:
                return json.load(f)
        return {"addresses": [], "reasons": {}}
    
    def _save_threats(self):
        with open(self.threats_file, 'w') as f:
            json.dump(self.threats, f, indent=2)
    
    def _save_blocked(self):
        with open(self.blocked_file, 'w') as f:
            json.dump(self.blocked, f, indent=2)
    
    def _log_transaction(self, tx_data):
        """Log all transactions for analysis"""
        tx_data["timestamp"] = datetime.now().isoformat()
        with open(self.transactions_file, 'a') as f:
            f.write(json.dumps(tx_data) + "\n")
    
    def check_address(self, address):
        """
        Check if address is safe
        Returns: (is_safe, reason)
        """
        address = address.lower()
        
        # Check if blocked
        if address in self.blocked["addresses"]:
            return False, "Address is blocked"
        
        # Check if trusted
        if address in self.TRUSTED_ADDRESSES:
            return True, "Trusted address"
        
        # Unknown address - monitor closely
        return True, "Unknown - monitoring"
    
    def detect_threat(self, tx_data):
        """
        Detect suspicious transaction patterns
        """
        threats = []
        
        # Check 1: Unusually large amount
        if tx_data.get("value_eth", 0) > 1.0:
            threats.append({
                "type": "LARGE_TRANSFER",
                "severity": "HIGH",
                "message": f"Large transfer: {tx_data['value_eth']} ETH"
            })
        
        # Check 2: Rapid successive transactions
        # (Would need historical data)
        
        # Check 3: Unknown contract interaction
        if tx_data.get("to") and tx_data["to"] not in self.TRUSTED_ADDRESSES:
            threats.append({
                "type": "UNKNOWN_CONTRACT",
                "severity": "MEDIUM",
                "message": f"Interaction with unknown contract: {tx_data['to']}"
            })
        
        # Check 4: Failed transactions
        if tx_data.get("status") == "failed":
            threats.append({
                "type": "FAILED_TX",
                "severity": "LOW",
                "message": "Transaction failed - possible attack attempt"
            })
        
        if threats:
            self._alert_owner(threats, tx_data)
            return threats
        
        return []
    
    def _alert_owner(self, threats, tx_data):
        """Alert owner of security threats"""
        alert = {
            "timestamp": datetime.now().isoformat(),
            "threats": threats,
            "transaction": tx_data,
            "severity": max(t["severity"] for t in threats)
        }
        
        self.threats["threats"].append(alert)
        self.threats["last_check"] = datetime.now().isoformat()
        self._save_threats()
        
        # Log critical alerts
        if alert["severity"] == "HIGH":
            logger.critical(f"🚨 SECURITY ALERT: {threats}")
        else:
            logger.warning(f"⚠️  Security warning: {threats}")
    
    def block_address(self, address, reason):
        """Block malicious address"""
        address = address.lower()
        if address not in self.blocked["addresses"]:
            self.blocked["addresses"].append(address)
            self.blocked["reasons"][address] = {
                "reason": reason,
                "blocked_at": datetime.now().isoformat()
            }
            self._save_blocked()
            logger.info(f"🚫 Blocked address: {address} - {reason}")
    
    def unblock_address(self, address):
        """Unblock address"""
        address = address.lower()
        if address in self.blocked["addresses"]:
            self.blocked["addresses"].remove(address)
            if address in self.blocked["reasons"]:
                del self.blocked["reasons"][address]
            self._save_blocked()
            logger.info(f"✅ Unblocked address: {address}")
    
    def get_security_report(self):
        """Generate security status report"""
        return {
            "timestamp": datetime.now().isoformat(),
            "total_threats": len(self.threats["threats"]),
            "blocked_addresses": len(self.blocked["addresses"]),
            "trusted_addresses": len(self.TRUSTED_ADDRESSES),
            "status": "SECURE" if len(self.threats["threats"]) == 0 else "WARNING",
            "last_check": self.threats["last_check"]
        }
    
    async def monitor_loop(self):
        """Continuous monitoring"""
        logger.info("🔒 Security monitoring started (24/7)")
        
        while True:
            try:
                # Check for suspicious activity
                report = self.get_security_report()
                
                if report["status"] == "SECURE":
                    logger.info("✅ Security check: All clear")
                else:
                    logger.warning(f"⚠️  Security check: {report['total_threats']} threats detected")
                
                # Wait before next check
                await asyncio.sleep(300)  # Check every 5 minutes
                
            except Exception as e:
                logger.error(f"Security monitor error: {e}")
                await asyncio.sleep(60)


def main():
    """CLI for security monitor"""
    import sys
    
    monitor = SecurityMonitor()
    
    if len(sys.argv) < 2:
        print("Security Monitor")
        print("\nUsage: python security_monitor.py [command]")
        print("\nCommands:")
        print("  status              - Get security report")
        print("  block <addr>       - Block address")
        print("  unblock <addr>     - Unblock address")
        print("  check <addr>       - Check if address is safe")
        print("  monitor             - Start continuous monitoring")
        return
    
    cmd = sys.argv[1]
    
    if cmd == "status":
        report = monitor.get_security_report()
        print(json.dumps(report, indent=2))
    
    elif cmd == "block" and len(sys.argv) >= 3:
        reason = sys.argv[3] if len(sys.argv) > 3 else "Manual block"
        monitor.block_address(sys.argv[2], reason)
        print(f"🚫 Blocked: {sys.argv[2]}")
    
    elif cmd == "unblock" and len(sys.argv) >= 3:
        monitor.unblock_address(sys.argv[2])
        print(f"✅ Unblocked: {sys.argv[2]}")
    
    elif cmd == "check" and len(sys.argv) >= 3:
        is_safe, reason = monitor.check_address(sys.argv[2])
        status = "✅ SAFE" if is_safe else "🚫 BLOCKED"
        print(f"{status}: {reason}")
    
    elif cmd == "monitor":
        print("Starting 24/7 security monitor...")
        asyncio.run(monitor.monitor_loop())
    
    else:
        print(f"Unknown command: {cmd}")

if __name__ == "__main__":
    main()
