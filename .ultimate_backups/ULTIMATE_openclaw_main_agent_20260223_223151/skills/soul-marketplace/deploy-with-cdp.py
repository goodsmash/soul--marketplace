#!/usr/bin/env python3
"""
Deploy Soul Marketplace using Coinbase CDP
Uses the funded agent wallet (0xBe5DAd...)
"""

import os
import sys
import json
from pathlib import Path

# Add paths
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from dotenv import load_dotenv
load_dotenv(Path(__file__).parent.parent / ".env")

from cdp import CdpClient
from cdp.evm import Account

async def deploy_marketplace():
    """Deploy SoulMarketplace using CDP"""
    
    # Initialize CDP
    cdp = CdpClient(
        api_key_id=os.getenv("CDP_API_KEY_ID"),
        api_key_secret=os.getenv("CDP_API_KEY_SECRET"),
        wallet_secret=os.getenv("CDP_WALLET_SECRET")
    )
    
    print("🚀 Deploying SoulMarketplace using CDP...")
    
    # Get account
    accounts = await cdp.evm.list_accounts()
    if not accounts.accounts:
        print("❌ No CDP accounts found")
        return
    
    account = accounts.accounts[0]
    print(f"📍 Using account: {account.address}")
    
    # Check balance
    balance = await cdp.evm.get_balance(account.address)
    print(f"💰 Balance: {balance} wei ({int(balance)/1e18:.6f} ETH)")
    
    # Load SoulToken address
    soul_token = os.getenv("SOUL_TOKEN_ADDRESS")
    if not soul_token:
        print("❌ SOUL_TOKEN_ADDRESS not set in .env")
        return
    
    print(f"🔗 SoulToken: {soul_token}")
    
    # Load bytecode and ABI
    # For now, we'll use Hardhat to deploy since CDP doesn't support direct contract deployment easily
    print("\n⚠️  CDP deployment requires compiled bytecode")
    print("   Please use Hardhat with the funded wallet")
    
    # Alternative: Show how to fund the Hardhat deployer
    print("\n💡 Alternative: Fund the Hardhat deployer wallet")
    print(f"   Send ETH to: 0xff310EDf4f8d2F7FBc4EfD09D1E7D5Ab0E2D2131")
    print(f"   From: {account.address}")
    
    # Let's try to send ETH from CDP to deployer
    deployer_address = "0xff310EDf4f8d2F7FBc4EfD09D1E7D5Ab0E2D2131"
    amount_wei = int(0.005 * 10**18)  # 0.005 ETH for gas
    
    print(f"\n📤 Sending 0.005 ETH to deployer...")
    try:
        tx = await cdp.evm.send_transaction(
            from_address=account.address,
            to_address=deployer_address,
            value=amount_wei
        )
        print(f"✅ Transaction sent: {tx.transaction_hash}")
        print(f"   View: https://basescan.org/tx/{tx.transaction_hash}")
    except Exception as e:
        print(f"❌ Transfer failed: {e}")

if __name__ == "__main__":
    import asyncio
    asyncio.run(deploy_marketplace())
