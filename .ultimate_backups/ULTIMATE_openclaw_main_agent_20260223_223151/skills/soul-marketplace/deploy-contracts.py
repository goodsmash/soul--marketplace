#!/usr/bin/env python3
"""
Deploy Soul Marketplace contracts using web3 and CDP
"""

import os
import json
from pathlib import Path
from dotenv import load_dotenv
from web3 import Web3

load_dotenv()

# Connect to Base Mainnet
w3 = Web3(Web3.HTTPProvider('https://mainnet.base.org'))

# Load SoulToken ABI and bytecode
CONTRACTS_DIR = Path(__file__).parent / "contracts"

# Load compiled contract data
def load_contract_data(contract_name):
    """Load ABI and bytecode from Hardhat artifacts"""
    artifact_path = CONTRACTS_DIR / "artifacts" / "contracts" / f"{contract_name}.sol" / f"{contract_name}.json"
    
    if not artifact_path.exists():
        print(f"❌ Artifact not found: {artifact_path}")
        print("   Run: cd contracts && npx hardhat compile")
        return None, None
    
    with open(artifact_path, 'r') as f:
        data = json.load(f)
    
    return data['abi'], data['bytecode']

def deploy_contract(contract_name, *constructor_args):
    """Deploy a contract"""
    print(f"\n🚀 Deploying {contract_name}...")
    
    # Load contract data
    abi, bytecode = load_contract_data(contract_name)
    if not abi or not bytecode:
        return None
    
    # Get deployer account
    private_key = os.getenv('PRIVATE_KEY')
    if not private_key:
        print("❌ PRIVATE_KEY not set in .env")
        return None
    
    account = w3.eth.account.from_key(private_key)
    print(f"📍 Deployer: {account.address}")
    
    # Check balance
    balance = w3.eth.get_balance(account.address)
    print(f"💰 Balance: {w3.from_wei(balance, 'ether'):.6f} ETH")
    
    if balance < w3.to_wei(0.001, 'ether'):
        print("❌ Insufficient balance for deployment")
        print("   Need at least 0.001 ETH for gas")
        return None
    
    # Create contract
    Contract = w3.eth.contract(abi=abi, bytecode=bytecode)
    
    # Build transaction
    nonce = w3.eth.get_transaction_count(account.address)
    
    # Estimate gas
    try:
        estimated_gas = Contract.constructor(*constructor_args).estimate_gas({
            'from': account.address
        })
        gas_limit = int(estimated_gas * 1.2)  # Add 20% buffer
        print(f"⛽ Estimated gas: {estimated_gas}, using: {gas_limit}")
    except Exception as e:
        print(f"⚠️  Gas estimation failed: {e}")
        gas_limit = 3000000  # Default
    
    # Build deployment transaction
    tx = Contract.constructor(*constructor_args).build_transaction({
        'from': account.address,
        'nonce': nonce,
        'gas': gas_limit,
        'gasPrice': w3.to_wei('0.1', 'gwei'),
        'chainId': 8453  # Base Mainnet
    })
    
    print(f"📤 Signing transaction...")
    signed_tx = w3.eth.account.sign_transaction(tx, private_key)
    
    print(f"📤 Sending transaction...")
    tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
    
    print(f"⏳ Waiting for confirmation...")
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
    
    contract_address = tx_receipt.contractAddress
    
    print(f"✅ {contract_name} deployed!")
    print(f"   Address: {contract_address}")
    print(f"   Tx Hash: {tx_hash.hex()}")
    print(f"   Gas Used: {tx_receipt.gasUsed}")
    print(f"   View: https://basescan.org/address/{contract_address}")
    
    return contract_address

def main():
    """Deploy all contracts"""
    
    print("🧬 Soul Marketplace Deployment")
    print("=" * 50)
    
    # Check connection
    if not w3.is_connected():
        print("❌ Failed to connect to Base Mainnet")
        return
    
    print(f"✅ Connected to Base Mainnet")
    print(f"   Block: {w3.eth.block_number}")
    
    # Get SoulToken address
    soul_token = os.getenv('SOUL_TOKEN_ADDRESS')
    if not soul_token:
        print("❌ SOUL_TOKEN_ADDRESS not set")
        return
    
    print(f"\n📄 SoulToken: {soul_token}")
    
    # Deploy SoulMarketplace
    fee_recipient = "0xBe5DAd52427Fa812C198365AAb6fe916E1a61269"  # Agent wallet
    
    marketplace_address = deploy_contract('SoulMarketplace', soul_token, fee_recipient)
    
    if marketplace_address:
        # Save deployment info
        deployment = {
            'contract_name': 'SoulMarketplace',
            'address': marketplace_address,
            'soul_token': soul_token,
            'fee_recipient': fee_recipient,
            'network': 'base-mainnet',
            'deployed_at': '2026-02-23T20:00:00Z',
            'tx_hash': ''
        }
        
        output_path = Path(__file__).parent / "MARKETPLACE_DEPLOYMENT.json"
        with open(output_path, 'w') as f:
            json.dump(deployment, f, indent=2)
        
        print(f"\n💾 Deployment saved to {output_path}")
        print(f"\n📝 Update .env with:")
        print(f"   MARKETPLACE_ADDRESS={marketplace_address}")

if __name__ == "__main__":
    main()
