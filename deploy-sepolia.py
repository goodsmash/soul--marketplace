#!/usr/bin/env python3
"""
Deploy on Base Sepolia using CDP wallet
Sepolia is free and gas is cheap
"""

import os
import json
from dotenv import load_dotenv
from pathlib import Path
from web3 import Web3

load_dotenv()

# Connect to Base Sepolia
w3 = Web3(Web3.HTTPProvider('https://sepolia.base.org'))

print("🚀 Deploying on Base Sepolia (Free/Cheap)")
print("=" * 60)
print(f"Connected: {w3.is_connected()}")
print(f"Chain ID: {w3.eth.chain_id}")
print(f"Block: {w3.eth.block_number}")

# Use the deployer key
private_key = os.getenv('PRIVATE_KEY')
if not private_key:
    print("❌ PRIVATE_KEY not set")
    exit(1)

account = w3.eth.account.from_key(private_key)
print(f"\n📍 Deployer: {account.address}")

# Check balance on Sepolia
balance = w3.eth.get_balance(account.address)
balance_eth = w3.from_wei(balance, 'ether')
print(f"💰 Balance: {balance_eth} ETH")

if balance == 0:
    print("\n⚠️  Deployer has no Sepolia ETH")
    print("   Get free ETH from: https://www.coinbase.com/faucets/base-sepolia-faucet")
    print(f"   Address to fund: {account.address}")
    exit(1)

print("\n✅ Deployer has Sepolia ETH - ready to deploy!")

# Load contract artifacts
CONTRACTS_DIR = Path(__file__).parent / "contracts"

def deploy_contract(name, *args):
    """Deploy a contract"""
    print(f"\n🚀 Deploying {name}...")
    
    artifact_path = CONTRACTS_DIR / "artifacts" / "contracts" / f"{name}.sol" / f"{name}.json"
    
    if not artifact_path.exists():
        print(f"❌ Artifact not found at {artifact_path}")
        print("   Run: cd contracts && npx hardhat compile")
        return None
    
    with open(artifact_path, 'r') as f:
        artifact = json.load(f)
    
    abi = artifact['abi']
    bytecode = artifact['bytecode']
    
    # Create contract
    Contract = w3.eth.contract(abi=abi, bytecode=bytecode)
    
    # Build transaction
    nonce = w3.eth.get_transaction_count(account.address)
    
    # Estimate gas
    try:
        estimated = Contract.constructor(*args).estimate_gas({'from': account.address})
        gas_limit = int(estimated * 1.2)
        print(f"   Gas estimate: {estimated}, using: {gas_limit}")
    except Exception as e:
        print(f"   ⚠️  Gas estimation failed: {e}")
        gas_limit = 3000000
    
    tx = Contract.constructor(*args).build_transaction({
        'from': account.address,
        'nonce': nonce,
        'gas': gas_limit,
        'gasPrice': w3.to_wei('0.001', 'gwei'),  # Very cheap on Sepolia
        'chainId': 84532
    })
    
    # Sign and send
    print("   Signing transaction...")
    signed = w3.eth.account.sign_transaction(tx, private_key)
    
    print("   Sending transaction...")
    tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
    
    print(f"   Waiting for confirmation...")
    print(f"   Tx: https://sepolia.basescan.org/tx/{tx_hash.hex()}")
    
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=180)
    
    if receipt.status == 1:
        print(f"   ✅ {name} deployed!")
        print(f"   Address: {receipt.contractAddress}")
        return receipt.contractAddress
    else:
        print(f"   ❌ Deployment failed")
        return None

# Deploy SoulToken first
fee_recipient = account.address
soul_token = deploy_contract('SoulToken', fee_recipient)

if not soul_token:
    print("❌ SoulToken deployment failed")
    exit(1)

# Deploy Marketplace
marketplace = deploy_contract('SoulMarketplace', soul_token, fee_recipient)

if not marketplace:
    print("❌ Marketplace deployment failed")
    exit(1)

# Save deployment info
deployment = {
    'network': 'base-sepolia',
    'chain_id': 84532,
    'deployer': account.address,
    'contracts': {
        'SoulToken': soul_token,
        'SoulMarketplace': marketplace
    },
    'timestamp': '2026-02-23T21:00:00Z'
}

output = Path(__file__).parent / 'SEPOLIA_DEPLOYMENT.json'
with open(output, 'w') as f:
    json.dump(deployment, f, indent=2)

print("\n" + "=" * 60)
print("✅ DEPLOYMENT COMPLETE!")
print("=" * 60)
print(f"SoulToken: {soul_token}")
print(f"Marketplace: {marketplace}")
print(f"\nView on Sepolia:")
print(f"   https://sepolia.basescan.org/address/{soul_token}")
print(f"   https://sepolia.basescan.org/address/{marketplace}")
print(f"\nSaved to: {output}")
