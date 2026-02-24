#!/usr/bin/env python3
"""
COMPLETE PROJECT - Use Sepolia (FREE) for full deployment & testing
"""

import os
import json
import time
from pathlib import Path
from dotenv import load_dotenv
from web3 import Web3

load_dotenv()

print("🚀 COMPLETING PROJECT - Sepolia Deployment (FREE)")
print("=" * 70)

# Use Sepolia (free ETH from faucet)
w3 = Web3(Web3.HTTPProvider('https://sepolia.base.org'))
print(f"\n🔗 Connected to Base Sepolia")
print(f"   Chain ID: {w3.eth.chain_id}")
print(f"   Block: {w3.eth.block_number}")

# Deployer
private_key = os.getenv('PRIVATE_KEY')
if not private_key:
    print("❌ PRIVATE_KEY not set")
    exit(1)

account = w3.eth.account.from_key(private_key)
deployer = account.address

print(f"\n📍 Deployer: {deployer}")

# Check balance
balance = w3.eth.get_balance(deployer)
balance_eth = w3.from_wei(balance, 'ether')
print(f"💰 Balance: {balance_eth} ETH")

if balance == 0:
    print("\n⚠️  Need Sepolia ETH (FREE)")
    print("   Get from: https://www.coinbase.com/faucets/base-sepolia-faucet")
    print(f"   Address: {deployer}")
    
    # Save address for easy copy-paste
    with open('DEPLOYER_ADDRESS.txt', 'w') as f:
        f.write(deployer)
    
    print("\n   📄 Address saved to DEPLOYER_ADDRESS.txt")
    print("   Copy this address and get free ETH from the faucet")
    exit(1)

print("✅ Deployer has Sepolia ETH!")
print("=" * 70)

# Load contract artifacts
CONTRACTS_DIR = Path(__file__).parent / "contracts"

def deploy_contract(name, *args):
    """Deploy a contract"""
    print(f"\n🚀 Deploying {name}...")
    
    artifact_path = CONTRACTS_DIR / "artifacts" / "contracts" / f"{name}.sol" / f"{name}.json"
    
    if not artifact_path.exists():
        print(f"❌ Artifact not found. Compiling...")
        import subprocess
        result = subprocess.run(
            ['npx', 'hardhat', 'compile'],
            cwd=CONTRACTS_DIR,
            capture_output=True,
            text=True
        )
        if result.returncode != 0:
            print(f"❌ Compilation failed: {result.stderr}")
            return None
    
    with open(artifact_path, 'r') as f:
        artifact = json.load(f)
    
    abi = artifact['abi']
    bytecode = artifact['bytecode']
    
    # Create contract
    Contract = w3.eth.contract(abi=abi, bytecode=bytecode)
    
    # Build transaction
    nonce = w3.eth.get_transaction_count(deployer)
    
    try:
        estimated = Contract.constructor(*args).estimate_gas({'from': deployer})
        gas_limit = int(estimated * 1.2)
    except:
        gas_limit = 3000000
    
    tx = Contract.constructor(*args).build_transaction({
        'from': deployer,
        'nonce': nonce,
        'gas': gas_limit,
        'gasPrice': w3.to_wei('0.001', 'gwei'),
        'chainId': 84532
    })
    
    print(f"   Signing...")
    signed = w3.eth.account.sign_transaction(tx, private_key)
    
    print(f"   Sending...")
    tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
    
    print(f"   Tx: https://sepolia.basescan.org/tx/{tx_hash.hex()}")
    print(f"   Waiting for confirmation...")
    
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=180)
    
    if receipt.status == 1:
        print(f"   ✅ {name} deployed!")
        print(f"   Address: {receipt.contractAddress}")
        return receipt.contractAddress
    else:
        print(f"   ❌ Failed")
        return None

# Deploy SoulToken
print("\n" + "=" * 70)
print("STEP 1: Deploy SoulToken")
print("=" * 70)

soul_token = deploy_contract('SoulToken', deployer)

if not soul_token:
    print("❌ SoulToken deployment failed")
    exit(1)

# Deploy Marketplace
print("\n" + "=" * 70)
print("STEP 2: Deploy SoulMarketplace")
print("=" * 70)

marketplace = deploy_contract('SoulMarketplace', soul_token, deployer)

if not marketplace:
    print("❌ Marketplace deployment failed")
    exit(1)

# Save deployment
print("\n" + "=" * 70)
print("STEP 3: Save Deployment Info")
print("=" * 70)

deployment = {
    'network': 'base-sepolia',
    'chain_id': 84532,
    'deployer': deployer,
    'contracts': {
        'SoulToken': soul_token,
        'SoulMarketplace': marketplace
    },
    'explorer_urls': {
        'SoulToken': f'https://sepolia.basescan.org/address/{soul_token}',
        'Marketplace': f'https://sepolia.basescan.org/address/{marketplace}'
    },
    'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ')
}

output_file = Path(__file__).parent / 'SEPOLIA_DEPLOYMENT.json'
with open(output_file, 'w') as f:
    json.dump(deployment, f, indent=2)

print(f"✅ Saved to {output_file}")

# Update .env
print("\n" + "=" * 70)
print("STEP 4: Update .env")
print("=" * 70)

env_file = Path(__file__).parent / '.env'
env_lines = env_file.read_text().split('\n')

new_lines = []
for line in env_lines:
    if line.startswith('SOUL_TOKEN_ADDRESS=') and not line.endswith(soul_token):
        new_lines.append(f'SOUL_TOKEN_ADDRESS={soul_token}')
    elif line.startswith('MARKETPLACE_ADDRESS=') and marketplace:
        new_lines.append(f'MARKETPLACE_ADDRESS={marketplace}')
    else:
        new_lines.append(line)

env_file.write_text('\n'.join(new_lines))
print("✅ .env updated")

# Final summary
print("\n" + "=" * 70)
print("🎉 DEPLOYMENT COMPLETE!")
print("=" * 70)
print(f"\n📄 Contract Addresses:")
print(f"   SoulToken: {soul_token}")
print(f"   Marketplace: {marketplace}")
print(f"\n🔗 Explorer Links:")
print(f"   SoulToken: https://sepolia.basescan.org/address/{soul_token}")
print(f"   Marketplace: https://sepolia.basescan.org/address/{marketplace}")
print(f"\n💾 Files Updated:")
print(f"   SEPOLIA_DEPLOYMENT.json")
print(f"   .env")
print(f"\n✅ PROJECT COMPLETE!")
print("=" * 70)
