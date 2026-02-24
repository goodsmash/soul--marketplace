#!/usr/bin/env python3
"""
Get Sepolia ETH from multiple faucets
"""

import time
import requests
from web3 import Web3

print("🚰 Getting Sepolia ETH (FREE)")
print("=" * 60)

address = "0xff310EDf4f8d2F7FBc4EfD09D1E7D5Ab0E2D2131"
print(f"Address: {address}")

# Check current balance
w3 = Web3(Web3.HTTPProvider('https://sepolia.base.org'))
balance = w3.eth.get_balance(address)
print(f"Current: {w3.from_wei(balance, 'ether')} ETH")

if balance > 0:
    print("\n✅ Already funded!")
    exit(0)

print("\n" + "=" * 60)
print("CLAIM FROM THESE FAUCETS:")
print("=" * 60)

faucets = [
    ("Coinbase", "https://www.coinbase.com/faucets/base-sepolia-faucet"),
    ("Alchemy", "https://www.alchemy.com/faucets/base-sepolia"),
    ("QuickNode", "https://faucet.quicknode.com/base/sepolia"),
    ("Infura", "https://www.infura.io/faucet/base-sepolia"),
]

for name, url in faucets:
    print(f"\n{name}:")
    print(f"  URL: {url}")
    print(f"  Address: {address}")

print("\n" + "=" * 60)
print("⏳ Waiting for funding...")
print("=" * 60)

# Monitor
attempt = 0
while True:
    attempt += 1
    balance = w3.eth.get_balance(address)
    
    if balance > 0:
        print(f"\n🎉 FUNDED! {w3.from_wei(balance, 'ether')} ETH")
        break
    
    if attempt % 6 == 0:
        print(f"  [{attempt}] Still waiting...")
    
    time.sleep(10)
