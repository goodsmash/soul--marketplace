#!/usr/bin/env python3
"""
Use CDP Agent API correctly to send ETH
"""

import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

async def send_eth():
    print("🚀 CDP Agent API - Send ETH (Correct API)")
    print("=" * 60)
    
    from cdp import CdpClient, SpendPermissionNetwork
    from cdp.evm_transaction_types import TransactionRequestEIP1559
    
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
    
    # Build transaction
    to_address = "0xff310EDf4f8d2F7FBc4EfD09D1E7D5Ab0E2D2131"
    
    tx_request = TransactionRequestEIP1559(
        to=to_address,
        value="5000000000000000",  # 0.005 ETH
        gas_limit="21000"
    )
    
    print(f"\n📤 Sending 0.005 ETH to {to_address}")
    
    try:
        tx_hash = await cdp.evm.send_transaction(
            address=account.address,
            transaction=tx_request,
            network=SpendPermissionNetwork.BASE
        )
        
        print(f"\n✅ Transaction sent!")
        print(f"   Hash: {tx_hash}")
        print(f"   View: https://basescan.org/tx/{tx_hash}")
        
        # Check balance
        await asyncio.sleep(5)
        
        from web3 import Web3
        w3 = Web3(Web3.HTTPProvider('https://mainnet.base.org'))
        balance = w3.eth.get_balance(to_address)
        
        print(f"\n💰 Deployer balance: {w3.from_wei(balance, 'ether')} ETH")
        
        if balance > 0:
            print("\n🎉 SUCCESS!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(send_eth())
