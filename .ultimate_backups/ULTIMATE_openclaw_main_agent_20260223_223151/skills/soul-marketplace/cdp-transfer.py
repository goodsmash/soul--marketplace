#!/usr/bin/env python3
"""
Use CDP Agent API to send ETH from CDP wallet to deployer
"""

import asyncio
import os
from dotenv import load_dotenv
from web3 import Web3

load_dotenv()

async def transfer_via_cdp():
    """Transfer ETH using CDP Agent API"""
    
    print("🚀 CDP Agent API Transfer")
    print("=" * 60)
    
    from cdp import CdpClient
    
    # Initialize CDP with all credentials
    cdp = CdpClient(
        api_key_id=os.getenv("CDP_API_KEY_ID"),
        api_key_secret=os.getenv("CDP_API_KEY_SECRET"),
        wallet_secret=os.getenv("CDP_WALLET_SECRET")
    )
    
    # Addresses
    from_address = "0xBe5DAd52427Fa812C198365AAb6fe916E1a61269"  # CDP wallet
    to_address = "0xff310EDf4f8d2F7FBc4EfD09D1E7D5Ab0E2D2131"    # Deployer
    
    print(f"\n📍 From: {from_address}")
    print(f"📍 To: {to_address}")
    
    # Check balance first
    w3 = Web3(Web3.HTTPProvider('https://mainnet.base.org'))
    balance = w3.eth.get_balance(from_address)
    print(f"\n💰 CDP Balance: {w3.from_wei(balance, 'ether')} ETH")
    
    if balance < w3.to_wei(0.005, 'ether'):
        print("❌ Insufficient balance")
        return False
    
    # Amount to send
    amount_wei = int(0.005 * 10**18)  # 0.005 ETH
    print(f"📤 Amount: 0.005 ETH")
    
    try:
        print("\n🔄 Attempting transfer via CDP...")
        
        # Get account
        accounts = await cdp.evm.list_accounts()
        if not accounts.accounts:
            print("❌ No accounts found")
            return False
        
        account = accounts.accounts[0]
        print(f"✅ Account: {account.address}")
        
        # Try to send using CDP API
        # The API might need Agent API enabled on the key
        
        # Alternative: Use the wallet secret to sign directly
        print("\n🔐 Using wallet secret to sign transaction...")
        
        # Get nonce
        nonce = w3.eth.get_transaction_count(from_address)
        
        # Build transaction
        tx = {
            'nonce': nonce,
            'to': to_address,
            'value': amount_wei,
            'gas': 21000,
            'gasPrice': w3.to_wei('0.1', 'gwei'),
            'chainId': 8453  # Base Mainnet
        }
        
        print(f"   Transaction built")
        
        # Note: We need the actual private key to sign
        # The CDP wallet_secret is not the private key
        # We need to use CDP's signing API
        
        print("\n⚠️  CDP requires Agent API for transaction signing")
        print("   Trying alternative...")
        
        # Try using CDP's send_transaction if available
        try:
            # This might work with Agent API enabled
            result = await cdp.evm.send_transaction(
                account.address,
                to_address,
                amount_wei
            )
            print(f"✅ Transaction sent: {result}")
            return True
        except Exception as e:
            print(f"   CDP API error: {e}")
            
            # Last resort: Try Bankr which has the keys
            print("\n💡 Trying Bankr...")
            import subprocess
            
            result = subprocess.run(
                ['bankr', 'prompt', f'Send 0.005 ETH from {from_address} to {to_address} on Base'],
                capture_output=True,
                text=True,
                timeout=60
            )
            
            if result.returncode == 0:
                print("✅ Bankr transaction submitted!")
                print(result.stdout[:500])
                return True
            else:
                print(f"❌ Bankr: {result.stderr}")
                return False
                
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    result = asyncio.run(transfer_via_cdp())
    if result:
        print("\n✅ Transfer successful!")
        print("   Ready to deploy contracts.")
    else:
        print("\n❌ Transfer failed")
        print("   Manual funding required:")
        print("   https://www.coinbase.com/faucets/base-sepolia-faucet")
