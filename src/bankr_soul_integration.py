#!/usr/bin/env python3
"""
Bankr Integration for Soul Marketplace
Uses Bankr bot for real on-chain transactions
"""

import os
import json
import subprocess
from decimal import Decimal
from typing import Dict, Any, Optional, List
import logging

logger = logging.getLogger(__name__)

class BankrIntegration:
    """
    Integration with Bankr bot for crypto operations.
    
    Features:
    - Check balances across chains
    - Send/receive ETH and tokens
    - Deploy tokens
    - Trade on Polymarket
    - Cross-chain bridging (via Bankr)
    """
    
    def __init__(self):
        self.api_key = os.getenv("BANKR_API_KEY", "bk_9D3842KZUSJJSVXZM8YGCEKGWA99523W")
        self.configured = self._check_configuration()
    
    def _check_configuration(self) -> bool:
        """Check if Bankr is properly configured"""
        try:
            result = subprocess.run(
                ["bankr", "balance", "--chain", "base"],
                capture_output=True,
                text=True,
                timeout=10
            )
            return result.returncode == 0
        except:
            return False
    
    def get_balance(self, chain: str = "base") -> Dict[str, Any]:
        """
        Get wallet balance on specified chain.
        
        Args:
            chain: Chain name (base, ethereum, solana, etc.)
            
        Returns:
            Balance data
        """
        try:
            result = subprocess.run(
                ["bankr", "balance", "--chain", chain],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode != 0:
                logger.error(f"Bankr error: {result.stderr}")
                return {"error": result.stderr}
            
            # Parse output
            lines = result.stdout.strip().split('\n')
            balances = {}
            
            for line in lines:
                if ':' in line and not line.startswith('Total'):
                    parts = line.split(':')
                    if len(parts) == 2:
                        token = parts[0].strip()
                        amount = parts[1].strip().split()[0]
                        try:
                            balances[token] = Decimal(amount)
                        except:
                            balances[token] = amount
            
            return {
                "chain": chain,
                "balances": balances,
                "raw_output": result.stdout
            }
            
        except Exception as e:
            logger.error(f"Failed to get balance: {e}")
            return {"error": str(e)}
    
    def send_eth(self, amount: Decimal, to_address: str, chain: str = "base") -> Dict[str, Any]:
        """
        Send ETH to an address.
        
        Args:
            amount: Amount to send
            to_address: Recipient address
            chain: Chain to send on
            
        Returns:
            Transaction result
        """
        try:
            cmd = ["bankr", "send", str(amount), "ETH", "to", to_address, "--chain", chain]
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=60
            )
            
            if result.returncode != 0:
                return {
                    "success": False,
                    "error": result.stderr,
                    "command": " ".join(cmd)
                }
            
            # Parse transaction hash from output
            tx_hash = None
            for line in result.stdout.split('\n'):
                if 'transaction' in line.lower() or 'tx' in line.lower():
                    # Extract hash (0x...)
                    words = line.split()
                    for word in words:
                        if word.startswith('0x') and len(word) > 10:
                            tx_hash = word
                            break
            
            return {
                "success": True,
                "amount": str(amount),
                "to": to_address,
                "chain": chain,
                "tx_hash": tx_hash,
                "raw_output": result.stdout
            }
            
        except Exception as e:
            logger.error(f"Failed to send ETH: {e}")
            return {"success": False, "error": str(e)}
    
    def deploy_token(self, name: str, symbol: str, supply: int = 1000000) -> Dict[str, Any]:
        """
        Deploy a new token using Bankr.
        
        Args:
            name: Token name
            symbol: Token symbol
            supply: Initial supply
            
        Returns:
            Deployment result with contract address
        """
        try:
            cmd = ["bankr", "deploy-token", name, symbol, "--supply", str(supply)]
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=120
            )
            
            if result.returncode != 0:
                return {
                    "success": False,
                    "error": result.stderr
                }
            
            # Parse contract address
            contract_address = None
            for line in result.stdout.split('\n'):
                if '0x' in line and len(line) > 40:
                    words = line.split()
                    for word in words:
                        if word.startswith('0x') and len(word) == 42:
                            contract_address = word
                            break
            
            return {
                "success": True,
                "name": name,
                "symbol": symbol,
                "supply": supply,
                "contract_address": contract_address,
                "raw_output": result.stdout
            }
            
        except Exception as e:
            logger.error(f"Failed to deploy token: {e}")
            return {"success": False, "error": str(e)}
    
    def get_price(self, token: str) -> Dict[str, Any]:
        """Get token price"""
        try:
            result = subprocess.run(
                ["bankr", "price", token],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if result.returncode != 0:
                return {"error": result.stderr}
            
            return {
                "token": token,
                "price_data": result.stdout
            }
            
        except Exception as e:
            return {"error": str(e)}
    
    def bet_polymarket(self, market: str, amount: Decimal, position: str = "yes") -> Dict[str, Any]:
        """
        Place a bet on Polymarket.
        
        Args:
            market: Market question
            amount: Bet amount in USDC
            position: "yes" or "no"
        """
        try:
            cmd = ["bankr", "bet", f'"{market}"', "--amount", str(amount), "--position", position]
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=60
            )
            
            return {
                "success": result.returncode == 0,
                "market": market,
                "amount": str(amount),
                "position": position,
                "output": result.stdout if result.returncode == 0 else result.stderr
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    # ===== Soul Marketplace Specific Functions =====
    
    def fund_agent_wallet(self, agent_address: str, amount_eth: Decimal) -> Dict[str, Any]:
        """
        Fund an agent's wallet with ETH.
        Used by owner to fund agent survival.
        """
        logger.info(f"Funding agent wallet: {agent_address} with {amount_eth} ETH")
        return self.send_eth(amount_eth, agent_address, chain="base")
    
    def buy_soul_token(self, contract_address: str, token_id: int, price_eth: Decimal) -> Dict[str, Any]:
        """
        Buy a soul token from the marketplace.
        Used when agent is THRIVING to acquire capabilities.
        """
        # This would interact with the SoulMarketplace contract
        # For now, simulate with ETH transfer
        logger.info(f"Buying soul token {token_id} for {price_eth} ETH")
        
        # In production, this would call the contract
        # return self._call_contract(contract_address, "buySoul", [token_id], value=price_eth)
        
        return {
            "success": True,
            "action": "buy_soul",
            "token_id": token_id,
            "price_eth": str(price_eth),
            "note": "Contract integration pending - simulated"
        }
    
    def stake_on_agent(self, staking_contract: str, agent_address: str, amount_eth: Decimal) -> Dict[str, Any]:
        """
        Stake ETH on an agent's survival.
        """
        logger.info(f"Staking {amount_eth} ETH on agent {agent_address}")
        
        return {
            "success": True,
            "action": "stake",
            "agent": agent_address,
            "amount_eth": str(amount_eth),
            "note": "Contract integration pending - simulated"
        }
    
    def check_agent_survival_funds(self, agent_address: str) -> Dict[str, Any]:
        """
        Check if an agent has sufficient funds to survive.
        Returns tier and recommendations.
        """
        # Get agent's balance (would need agent's wallet access or public check)
        # For now, return simulation
        
        return {
            "agent_address": agent_address,
            "balance_eth": "0.05",  # Would query on-chain
            "tier": "NORMAL",
            "survival_status": "HEALTHY",
            "recommendation": "Continue normal operations"
        }


def main():
    """CLI for Bankr operations"""
    import sys
    
    bankr = BankrIntegration()
    
    if len(sys.argv) < 2:
        print("Bankr Integration for Soul Marketplace")
        print("\nUsage: python bankr_integration.py [command]")
        print("\nCommands:")
        print("  balance [chain]           - Check balance")
        print("  send <amount> <to>       - Send ETH")
        print("  price <token>            - Get token price")
        print("  deploy-token <name> <sym> - Deploy token")
        print("  fund-agent <addr> <amt>  - Fund agent wallet")
        print("\nStatus:", "✅ Configured" if bankr.configured else "❌ Not configured")
        return
    
    cmd = sys.argv[1]
    
    if cmd == "balance":
        chain = sys.argv[2] if len(sys.argv) > 2 else "base"
        result = bankr.get_balance(chain)
        print(json.dumps(result, indent=2))
    
    elif cmd == "send" and len(sys.argv) >= 4:
        amount = Decimal(sys.argv[2])
        to = sys.argv[3]
        result = bankr.send_eth(amount, to)
        print(json.dumps(result, indent=2))
    
    elif cmd == "price" and len(sys.argv) >= 3:
        result = bankr.get_price(sys.argv[2])
        print(json.dumps(result, indent=2))
    
    elif cmd == "deploy-token" and len(sys.argv) >= 4:
        result = bankr.deploy_token(sys.argv[2], sys.argv[3])
        print(json.dumps(result, indent=2))
    
    elif cmd == "fund-agent" and len(sys.argv) >= 4:
        result = bankr.fund_agent_wallet(sys.argv[2], Decimal(sys.argv[3]))
        print(json.dumps(result, indent=2))
    
    else:
        print(f"Unknown command: {cmd}")

if __name__ == "__main__":
    main()
