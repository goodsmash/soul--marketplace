#!/usr/bin/env python3
"""
Use CDP Agent API correctly to send ETH
"""

import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

async def send_with_cdp():
    print("🚀 CDP Agent API - Send ETH")
    print("=" * 60)
    
    from cdp import CdpClient
    from cdp.evm import NetworkIdentifier
    
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
    
    # Send transaction
    to_address = "0xff310EDf4f8d2F7FBc4EfD09D1E7D5Ab0E2D2131"
    amount = "5000000000000000"  # 0.005 ETH in wei as string
    
    print(f"\n📤 Sending 0.005 ETH to {to_address}")
    
    try:
        # Correct API call
        tx = await cdp.evm.send_transaction(
            address=account.address,
            network=NetworkIdentifier.BASE_MAINNET,  # Use the enum
            to=to_address,
            value=amount
        )
        
        print(f"✅ Transaction sent!")
        print(f"   Hash: {tx.transaction_hash}")
        print(f"   View: https://basescan.org/tx/{tx.transaction_hash}")
        
        # Wait and check
        await asyncio.sleep(5)
        
        from web3 import Web3
        w3 = Web3(Web3.HTTPProvider('https://mainnet.base.org'))
        balance = w3.eth.get_balance(to_address)
        print(f"\n💰 Deployer balance: {w3.from_wei(balance, 'ether')} ETH")
        
        if balance > 0:
            print("🎉 SUCCESS!")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        print(f"\n💡 This means Agent API needs to be enabled at:")
        print(f"   https://portal.cdp.coinbase.com/")
        print(f"\n   Or use the manual faucet method:")
        print(f"   https://www.coinbase.com/faucets/base-sepolia-faucet")

if __name__ == "__main__":
    asyncio.run(send_with_cdp())
