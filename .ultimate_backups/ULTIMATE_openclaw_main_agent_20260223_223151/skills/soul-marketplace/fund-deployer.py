#!/usr/bin/env python3
"""
Fund the Hardhat deployer wallet from CDP wallet
"""

import asyncio
import os
from dotenv import load_dotenv
from cdp import CdpClient

load_dotenv()

async def fund_deployer():
    """Send ETH from CDP wallet to Hardhat deployer"""
    
    # Initialize CDP
    cdp = CdpClient(
        api_key_id=os.getenv("CDP_API_KEY_ID"),
        api_key_secret=os.getenv("CDP_API_KEY_SECRET"),
        wallet_secret=os.getenv("CDP_WALLET_SECRET")
    )
    
    # Addresses
    cdp_wallet = "0xBe5DAd52427Fa812C198365AAb6fe916E1a61269"
    deployer = "0xff310EDf4f8d2F7FBc4EfD09D1E7D5Ab0E2D2131"
    
    # Amount to send (0.005 ETH for gas)
    amount_wei = int(0.005 * 10**18)
    
    print("🔄 Funding Hardhat Deployer")
    print(f"   From (CDP): {cdp_wallet}")
    print(f"   To (Deployer): {deployer}")
    print(f"   Amount: 0.005 ETH")
    
    try:
        # Create account from CDP
        account_name = "openclaw-main-agent"
        
        # Try to get existing account
        accounts = await cdp.evm.list_accounts()
        account = None
        for acc in accounts.accounts:
            if acc.address.lower() == cdp_wallet.lower():
                account = acc
                break
        
        if not account:
            print("❌ CDP account not found")
            return
        
        print(f"✅ Found CDP account: {account.address}")
        
        # Send transaction
        print("📤 Sending transaction...")
        
        # Note: CDP v1.39 uses different API
        # Let's use web3 directly with the wallet secret
        from web3 import Web3
        
        w3 = Web3(Web3.HTTPProvider('https://mainnet.base.org'))
        
        # Get nonce
        nonce = w3.eth.get_transaction_count(cdp_wallet)
        
        # Build transaction
        tx = {
            'nonce': nonce,
            'to': deployer,
            'value': amount_wei,
            'gas': 21000,
            'gasPrice': w3.to_wei('0.1', 'gwei'),
            'chainId': 8453  # Base Mainnet
        }
        
        print(f"   Transaction built")
        print(f"   Note: CDP signing requires special handling")
        print(f"\n⚠️  Manual funding required")
        print(f"   Send 0.005 ETH from {cdp_wallet} to {deployer}")
        print(f"   Or update .env PRIVATE_KEY to the CDP wallet key")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(fund_deployer())
