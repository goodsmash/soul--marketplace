#!/usr/bin/env python3
"""
Try multiple methods to get Sepolia ETH
"""

import os
import sys
import time
import subprocess
from pathlib import Path
from web3 import Web3

print("🚰 GETTING SEPOLIA ETH - MULTI-METHOD ATTEMPT")
print("=" * 60)

# Address to fund
address = "0xff310EDf4f8d2F7FBc4EfD09D1E7D5Ab0E2D2131"
print(f"\n📍 Target: {address}")

# Connect to Sepolia
w3 = Web3(Web3.HTTPProvider('https://sepolia.base.org'))

# Check current balance
balance = w3.eth.get_balance(address)
print(f"💰 Current: {w3.from_wei(balance, 'ether')} ETH")

if balance > 0:
    print("\n✅ Already funded!")
    sys.exit(0)

print("\n" + "=" * 60)
print("METHOD 1: Bankr Request")
print("=" * 60)

# Try using bankr to request from faucet
try:
    result = subprocess.run(
        ['bankr', 'prompt', f'Get Sepolia ETH for {address} from faucet'],
        capture_output=True,
        text=True,
        timeout=30
    )
    print(f"Bankr output: {result.stdout[:500]}")
except Exception as e:
    print(f"Bankr failed: {e}")

print("\n" + "=" * 60)
print("METHOD 2: Direct Faucet API")
print("=" * 60)

# Try direct API requests to known faucets
faucets = [
    "https://sepolia-faucet.pk910.de/",
    "https://faucet.sepolia.dev/",
]

print("Trying alternative faucets...")
print("(Most require manual verification)")

print("\n" + "=" * 60)
print("MANUAL METHOD (Fastest)")
print("=" * 60)
print(f"""
Visit these URLs and enter: {address}

1. https://www.coinbase.com/faucets/base-sepolia-faucet
   - Best option, 0.1 ETH per day

2. https://sepoliafaucet.com/
   - Alternative option

3. https://faucet.quicknode.com/base/sepolia
   - Requires QuickNode account

The wallet will be checked every 10 seconds.
Once funded, run: python3 deploy-and-complete.py
""")

# Start monitoring
print("\n⏳ Starting monitor...")
attempt = 0
while True:
    try:
        attempt += 1
        balance = w3.eth.get_balance(address)
        
        if balance > 0:
            print(f"\n🎉 FUNDED! {w3.from_wei(balance, 'ether')} ETH")
            print("Run: python3 deploy-and-complete.py")
            break
        
        if attempt % 6 == 0:  # Every minute
            print(f"  [{attempt}] Still 0 ETH...")
        
        time.sleep(10)
        
    except KeyboardInterrupt:
        print("\nCancelled")
        break
    except Exception as e:
        print(f"  Error: {e}")
        time.sleep(10)
