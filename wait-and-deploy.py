#!/usr/bin/env python3
"""
Wait for faucet funding and auto-deploy
Monitors deployer wallet and deploys when funded
"""

import time
import sys
from pathlib import Path
from web3 import Web3

print("⏳ WAITING FOR FAUCET FUNDING")
print("=" * 60)

# Sepolia connection
w3 = Web3(Web3.HTTPProvider('https://sepolia.base.org'))

# Deployer address
deployer = "0xff310EDf4f8d2F7FBc4EfD09D1E7D5Ab0E2D2131"

print(f"\n📍 Monitoring: {deployer}")
print(f"🔗 Network: Base Sepolia")
print(f"💰 Target: > 0 ETH")

print("\n" + "=" * 60)
print("🚰 TO FUND THIS WALLET:")
print("=" * 60)
print("1. Visit: https://www.coinbase.com/faucets/base-sepolia-faucet")
print(f"2. Enter: {deployer}")
print("3. Click 'Claim'")
print("4. This script will auto-detect and deploy")
print("=" * 60)

print("\n⏳ Checking every 10 seconds...")
print("   (Press Ctrl+C to cancel)")

attempt = 0
while True:
    try:
        attempt += 1
        balance = w3.eth.get_balance(deployer)
        balance_eth = w3.from_wei(balance, 'ether')
        
        print(f"\r   Check #{attempt}: {balance_eth:.6f} ETH", end='', flush=True)
        
        if balance > 0:
            print(f"\n\n🎉 FUNDED! Balance: {balance_eth:.6f} ETH")
            print("\n🚀 Auto-deploying contracts...")
            
            # Run deployment
            import subprocess
            result = subprocess.run(
                ['python3', 'deploy-and-complete.py'],
                cwd=Path(__file__).parent,
                capture_output=True,
                text=True
            )
            
            print(result.stdout)
            if result.returncode == 0:
                print("\n✅ DEPLOYMENT COMPLETE!")
                print("\n📋 Next steps:")
                print("   python3 test-real-transactions.py")
                print("   ./push-to-github.sh")
            else:
                print(f"\n❌ Deployment failed: {result.stderr}")
            
            break
        
        time.sleep(10)
        
    except KeyboardInterrupt:
        print("\n\n⛔ Cancelled by user")
        sys.exit(0)
    except Exception as e:
        print(f"\n   Error: {e}")
        time.sleep(10)
