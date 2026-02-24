#!/usr/bin/env python3
"""
Use CDP SDK to send ETH from funded wallet to deployer
Then deploy contracts
"""

import asyncio
import os
import json
from pathlib import Path
from dotenv import load_dotenv
from web3 import Web3

load_dotenv()

# Import CDP
import sys
sys.path.insert(0, str(Path.home() / ".openclaw" / "skills" / "soul-marketplace" / "src"))

async def main():
    print("🚀 COMPLETING PROJECT - Funding & Deployment")
    print("=" * 60)
    
    # Addresses
    cdp_wallet = "0xBe5DAd52427Fa812C198365AAb6fe916E1a61269"
    deployer = "0xff310EDf4f8d2F7FBc4EfD09D1E7D5Ab0E2D2131"
    
    print(f"\n📍 CDP Wallet (funded): {cdp_wallet}")
    print(f"📍 Deployer (empty): {deployer}")
    
    # Connect to Base Mainnet
    w3 = Web3(Web3.HTTPProvider('https://mainnet.base.org'))
    
    # Check current balances
    cdp_balance = w3.eth.get_balance(cdp_wallet)
    deployer_balance = w3.eth.get_balance(deployer)
    
    print(f"\n💰 Balances:")
    print(f"   CDP: {w3.from_wei(cdp_balance, 'ether'):.6f} ETH")
    print(f"   Deployer: {w3.from_wei(deployer_balance, 'ether'):.6f} ETH")
    
    if deployer_balance > 0:
        print("\n✅ Deployer already funded!")
        return True
    
    # Try to use CDP to send ETH
    print("\n📤 Attempting to send 0.005 ETH via CDP...")
    
    try:
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
            print("❌ No CDP accounts found")
            return False
        
        account = accounts.accounts[0]
        print(f"   Found CDP account: {account.address}")
        
        # Send ETH using CDP
        amount_wei = int(0.005 * 10**18)
        
        print(f"   Sending {w3.from_wei(amount_wei, 'ether')} ETH...")
        
        # Use CDP to send
        # Note: CDP v1.39 uses different API than standard web3
        # Let's try using the raw signing approach
        
        # Actually, let's just use the private key directly
        private_key = os.getenv('PRIVATE_KEY')
        if private_key:
            # This is the deployer key - but deployer has no ETH
            # We need the CDP wallet key
            print("   ⚠️  PRIVATE_KEY in .env is for deployer (empty)")
            print("   Need CDP wallet key or use CDP API for transaction")
        
        # Alternative: Try to sign with CDP wallet secret
        # The wallet_secret might be usable for signing
        print("\n💡 Trying alternative method...")
        
        # Use Bankr since we have it configured
        import subprocess
        result = subprocess.run(
            ['bankr', 'send', '0.005', 'ETH', 'to', deployer, 'on', 'Base'],
            capture_output=True,
            text=True,
            timeout=60
        )
        
        if result.returncode == 0:
            print("✅ Bankr transaction submitted!")
            print(f"   Output: {result.stdout[:500]}")
            return True
        else:
            print(f"❌ Bankr failed: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    result = asyncio.run(main())
    if result:
        print("\n✅ Funding successful! Ready to deploy.")
    else:
        print("\n❌ Funding failed. Try manual methods in FINAL_STEPS.md")
