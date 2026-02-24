#!/usr/bin/env python3
"""
Deploy SoulMarketplace with correct SoulToken
"""

import os
import json
from pathlib import Path
from dotenv import load_dotenv
from web3 import Web3

load_dotenv()

print("🚀 Deploying SoulMarketplace")
print("=" * 60)

w3 = Web3(Web3.HTTPProvider('https://mainnet.base.org'))

# Load account
private_key = os.getenv('PRIVATE_KEY')
account = w3.eth.account.from_key(private_key)
deployer = account.address

print(f"Deployer: {deployer}")

# SoulToken NFT address
soul_token = "0x18104CA13677F9630a0188Ed8254ECFA604e0bbB"
print(f"SoulToken: {soul_token}")

# Load contract
CONTRACTS_DIR = Path(__file__).parent / "contracts"
artifact_path = CONTRACTS_DIR / "artifacts" / "contracts" / "SoulMarketplace.sol" / "SoulMarketplace.json"

with open(artifact_path, 'r') as f:
    artifact = json.load(f)

abi = artifact['abi']
bytecode = artifact['bytecode']

# Create contract
Contract = w3.eth.contract(abi=abi, bytecode=bytecode)

# Build transaction
fee_recipient = deployer

nonce = w3.eth.get_transaction_count(deployer)

try:
    estimated = Contract.constructor(soul_token, fee_recipient).estimate_gas({'from': deployer})
    gas_limit = int(estimated * 1.2)
    print(f"Gas estimate: {estimated}, using: {gas_limit}")
except Exception as e:
    print(f"Gas estimation failed: {e}")
    gas_limit = 1500000

tx = Contract.constructor(soul_token, fee_recipient).build_transaction({
    'from': deployer,
    'nonce': nonce,
    'gas': gas_limit,
    'gasPrice': w3.to_wei('0.1', 'gwei'),
    'chainId': 8453
})

print("Signing...")
signed = w3.eth.account.sign_transaction(tx, private_key)

print("Sending...")
tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)

print(f"Tx: {tx_hash.hex()}")
print(f"View: https://basescan.org/tx/{tx_hash.hex()}")

print("Waiting for confirmation...")
receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=180)

if receipt.status == 1:
    print(f"\n✅ SoulMarketplace deployed!")
    print(f"Address: {receipt.contractAddress}")
    
    # Save
    deployment = {
        'contract': 'SoulMarketplace',
        'address': receipt.contractAddress,
        'soul_token': soul_token,
        'network': 'base-mainnet',
        'deployer': deployer,
        'tx_hash': tx_hash.hex()
    }
    
    with open('MARKETPLACE_NFT_DEPLOYMENT.json', 'w') as f:
        json.dump(deployment, f, indent=2)
    
    print("Saved to MARKETPLACE_NFT_DEPLOYMENT.json")
    
    # Update .env
    env_file = Path('.env')
    content = env_file.read_text()
    content = content.replace(
        'SOUL_TOKEN_ADDRESS=0x2a8036e898Cbc1dB4CA8C2146cc385fB9CdB0bA3',
        f'SOUL_TOKEN_ADDRESS={soul_token}'
    )
    content = content.replace(
        'MARKETPLACE_ADDRESS=0xAC4136b1Fbe480dDB41C92EdAEaCf1E185F586d3',
        f'MARKETPLACE_ADDRESS={receipt.contractAddress}'
    )
    env_file.write_text(content)
    print("Updated .env")
    
else:
    print("❌ Deployment failed")
