#!/usr/bin/env python3
"""
Use CDP SDK directly to send ETH
"""

import asyncio
import os
from dotenv import load_dotenv
from web3 import Web3

load_dotenv()

async def send_via_cdp():
    print("💸 Sending ETH via CDP SDK")
    print("=" * 60)
    
    from cdp import CdpClient
    
    # Initialize CDP
    cdp = CdpClient(
        api_key_id=os.getenv("CDP_API_KEY_ID"),
        api_key_secret=os.getenv("CDP_API_KEY_SECRET"),
        wallet_secret=os.getenv("CDP_WALLET_SECRET")
    )
    
    # Get account
    accounts = await cdp.evm.list_accounts()
    if not accounts.accounts:
        print("❌ No accounts")
        return False
    
    account = accounts.accounts[0]
    print(f"From: {account.address}")
    
    to_address = "0xff310EDf4f8d2F7FBc4EfD09D1E7D5Ab0E2D2131"
    print(f"To: {to_address}")
    
    amount_wei = int(0.005 * 10**18)
    print(f"Amount: 0.005 ETH ({amount_wei} wei)")
    
    # Send transaction using CDP
    try:
        print("\n📤 Sending transaction...")
        
        # CDP v1.39 API
        tx = await cdp.evm.send_transaction(
            address=account.address,
            to=to_address,
            value=amount_wei,
            chain_id=8453  # Base Mainnet
        )
        
        print(f"✅ Transaction sent!")
        print(f"   Hash: {tx.transaction_hash}")
        print(f"   View: https://basescan.org/tx/{tx.transaction_hash}")
        
        # Wait for confirmation
        print("   Waiting for confirmation...")
        await asyncio.sleep(5)
        
        # Check balance
        w3 = Web3(Web3.HTTPProvider('https://mainnet.base.org'))
        balance = w3.eth.get_balance(to_address)
        print(f"\n💰 Deployer balance: {w3.from_wei(balance, 'ether')} ETH")
        
        if balance > 0:
            print("✅ FUNDING SUCCESSFUL!")
            return True
        else:
            print("⚠️  Balance still 0, waiting more...")
            await asyncio.sleep(10)
            balance = w3.eth.get_balance(to_address)
            if balance > 0:
                print("✅ FUNDING SUCCESSFUL!")
                return True
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    result = asyncio.run(send_via_cdp())
    if result:
        print("\n🎉 Ready to deploy contracts!")
    else:
        print("\n❌ Funding failed")
