#!/usr/bin/env python3
"""
Test Mint Soul and List for Sale
"""

import os
import json
from pathlib import Path
from dotenv import load_dotenv
from web3 import Web3

load_dotenv()

print("🧪 Testing Mint Soul & List for Sale")
print("=" * 60)

w3 = Web3(Web3.HTTPProvider('https://mainnet.base.org'))

# Load account
private_key = os.getenv('PRIVATE_KEY')
account = w3.eth.account.from_key(private_key)
deployer = account.address

print(f"Account: {deployer}")
print(f"Balance: {w3.from_wei(w3.eth.get_balance(deployer), 'ether')} ETH")

# Contract addresses
soul_token = "0x18104CA13677F9630a0188Ed8254ECFA604e0bbB"
marketplace = "0xd464cc6600F7Ce9Cac72b6338DadB217Da509306"

print(f"SoulToken: {soul_token}")
print(f"Marketplace: {marketplace}")

# Load ABIs
CONTRACTS_DIR = Path(__file__).parent / "contracts"

with open(CONTRACTS_DIR / "artifacts" / "contracts" / "SoulToken.sol" / "SoulToken.json") as f:
    soul_abi = json.load(f)['abi']

with open(CONTRACTS_DIR / "artifacts" / "contracts" / "SoulMarketplace.sol" / "SoulMarketplace.json") as f:
    mp_abi = json.load(f)['abi']

soul_contract = w3.eth.contract(address=soul_token, abi=soul_abi)
mp_contract = w3.eth.contract(address=marketplace, abi=mp_abi)

# Step 1: Mint Soul
print("\n📋 Step 1: Mint Soul NFT")

# Check if already has soul
try:
    soul_id = soul_contract.functions.agentToSoul(deployer).call()
    print(f"   Existing soul ID: {soul_id}")
    if soul_id > 0:
        print("   ✅ Already has soul!")
    else:
        print("   Minting new soul...")
        
        tx = soul_contract.functions.mintSoul(
            "OpenClawAgent",
            "AI Agent",
            "QmSoulMetadata123",
            ["coding", "file_management", "survival"]
        ).build_transaction({
            'from': deployer,
            'value': w3.to_wei(0.001, 'ether'),
            'gas': 300000,
            'gasPrice': w3.to_wei('0.1', 'gwei'),
            'nonce': w3.eth.get_transaction_count(deployer)
        })
        
        signed = w3.eth.account.sign_transaction(tx, private_key)
        tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
        
        print(f"   Tx: {tx_hash.hex()[:20]}...")
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
        
        if receipt.status == 1:
            soul_id = soul_contract.functions.agentToSoul(deployer).call()
            print(f"   ✅ Soul minted! ID: {soul_id}")
        else:
            print("   ❌ Minting failed")
            exit(1)
except Exception as e:
    print(f"   ❌ Error: {e}")
    import traceback
    traceback.print_exc()
    exit(1)

# Step 2: Approve Marketplace
print("\n📋 Step 2: Approve Marketplace")

tx = soul_contract.functions.approve(marketplace, soul_id).build_transaction({
    'from': deployer,
    'gas': 100000,
    'gasPrice': w3.to_wei('0.1', 'gwei'),
    'nonce': w3.eth.get_transaction_count(deployer)
})

signed = w3.eth.account.sign_transaction(tx, private_key)
tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)

if receipt.status == 1:
    print("   ✅ Marketplace approved")
else:
    print("   ❌ Approval failed")
    exit(1)

# Step 3: List Soul
print("\n📋 Step 3: List Soul for Sale")

price = w3.to_wei(0.01, 'ether')  # 0.01 ETH

tx = mp_contract.functions.listSoul(soul_id, price).build_transaction({
    'from': deployer,
    'gas': 200000,
    'gasPrice': w3.to_wei('0.1', 'gwei'),
    'nonce': w3.eth.get_transaction_count(deployer)
})

signed = w3.eth.account.sign_transaction(tx, private_key)
tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)

if receipt.status == 1:
    print(f"   ✅ Soul listed!")
    print(f"   Price: 0.01 ETH")
    print(f"   Tx: https://basescan.org/tx/{tx_hash.hex()}")
else:
    print("   ❌ Listing failed")
    exit(1)

# Verify listing
print("\n📋 Step 4: Verify Listing")
listing = mp_contract.functions.getListing(soul_id).call()
print(f"   Seller: {listing[0]}")
print(f"   Price: {w3.from_wei(listing[1], 'ether')} ETH")
print(f"   Active: {listing[3]}")

print("\n" + "=" * 60)
print("🎉 SUCCESS! Soul minted and listed!")
print("=" * 60)
