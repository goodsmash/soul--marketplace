#!/usr/bin/env python3
"""
Use CDP Agent API to send ETH - FIXED
"""

import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

async def send_eth():
    print("🚀 CDP Agent API - Send ETH")
    print("=" * 60)
    
    from cdp import CdpClient, SpendPermissionNetwork
    
    cdp = CdpClient(
        api_key_id=os.getenv("CDP_API_KEY_ID"),
        api_key_secret=os.getenv("CDP_API_KEY_SECRET"),
        wallet_secret=os.getenv("CDP_WALLET_SECRET")
    )
    
    # Get account
    accounts = await cdp.evm.list_accounts()
    if not accounts.accounts:
        print("❌ No accounts")
        return
    
    account = accounts.accounts[0]
    print(f"✅ Account: {account.address}")
    
    # Destination
    to_address = "0xff310EDf4f8d2F7FBc4EfD09D1E7D5Ab0E2D2131"
    
    print(f"\n📤 Sending 0.005 ETH to {to_address}")
    print(f"   Network: Base Mainnet")
    
    try:
        # Use SpendPermissionNetwork.BASE
        tx = await cdp.evm.send_transaction(
            address=account.address,
            network=SpendPermissionNetwork.BASE,
            to=to_address,
            value="5000000000000000"  # 0.005 ETH as string
        )
        
        print(f"\n✅ Transaction sent!")
        print(f"   Hash: {tx.transaction_hash}")
        print(f"   View: https://basescan.org/tx/{tx.transaction_hash}")
        
        # Check balance after
        await asyncio.sleep(5)
        
        from web3 import Web3
        w3 = Web3(Web3.HTTPProvider('https://mainnet.base.org'))
        balance = w3.eth.get_balance(to_address)
        
        print(f"\n💰 Deployer balance: {w3.from_wei(balance, 'ether')} ETH")
        
        if balance > 0:
            print("\n🎉 TRANSFER SUCCESSFUL!")
            print("   Ready to deploy contracts.")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print(f"\n⚠️  Agent API may need to be enabled at:")
        print(f"   https://portal.cdp.coinbase.com/")
        print(f"\n   Enable 'Agent API' for your API key")
        print(f"\n   OR use the free faucet:")
        print(f"   https://www.coinbase.com/faucets/base-sepolia-faucet")
        print(f"   Address: {to_address}")

if __name__ == "__main__":
    asyncio.run(send_eth())
