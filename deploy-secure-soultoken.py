#!/usr/bin/env python3
"""
Deploy Secure SoulToken with full security features
"""

import os
import json
from pathlib import Path
from dotenv import load_dotenv
from web3 import Web3

load_dotenv()

print("🚀 Deploying SECURE SoulToken (with ReentrancyGuard + Pausable)")
print("=" * 70)

w3 = Web3(Web3.HTTPProvider('https://mainnet.base.org'))

# Load account
private_key = os.getenv('PRIVATE_KEY')
account = w3.eth.account.from_key(private_key)
deployer = account.address

print(f"Deployer: {deployer}")
print(f"Balance: {w3.from_wei(w3.eth.get_balance(deployer), 'ether')} ETH")

# Load contract
CONTRACTS_DIR = Path(__file__).parent / "contracts"
artifact_path = CONTRACTS_DIR / "artifacts" / "contracts" / "SoulTokenSecure.sol" / "SoulTokenSecure.json"

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
    estimated = Contract.constructor(fee_recipient).estimate_gas({'from': deployer})
    gas_limit = int(estimated * 1.2)
    print(f"Gas estimate: {estimated}, using: {gas_limit}")
except Exception as e:
    print(f"Gas estimation failed: {e}")
    gas_limit = 4000000  # Higher for secure contract

tx = Contract.constructor(fee_recipient).build_transaction({
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
    print(f"\n✅ SECURE SoulToken deployed!")
    print(f"Address: {receipt.contractAddress}")
    print(f"Features:")
    print(f"  - ReentrancyGuard")
    print(f"  - Pausable")
    print(f"  - Emergency functions")
    print(f"  - 0.00001 ETH mint fee")
    
    # Save
    deployment = {
        'contract': 'SoulTokenSecure',
        'address': receipt.contractAddress,
        'network': 'base-mainnet',
        'deployer': deployer,
        'features': ['ReentrancyGuard', 'Pausable', 'EmergencyPause', 'EmergencyWithdraw'],
        'tx_hash': tx_hash.hex(),
        'timestamp': '2026-02-24T00:15:00Z'
    }
    
    with open('SOULTOKEN_SECURE_DEPLOYMENT.json', 'w') as f:
        json.dump(deployment, f, indent=2)
    
    print("\nSaved to SOULTOKEN_SECURE_DEPLOYMENT.json")
    
    # Update .env
    env_file = Path(__file__).parent.parent / '.env'
    if env_file.exists():
        content = env_file.read_text()
        if 'SOUL_TOKEN_SECURE_ADDRESS=' not in content:
            with open(env_file, 'a') as f:
                f.write(f"\nSOUL_TOKEN_SECURE_ADDRESS={receipt.contractAddress}\n")
            print("Updated .env with secure contract address")
else:
    print("❌ Deployment failed")
