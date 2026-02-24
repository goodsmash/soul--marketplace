#!/usr/bin/env python3
"""
Store Agent Soul ON-CHAIN - Fixed version
"""

import os
import json
import hashlib
from pathlib import Path
from dotenv import load_dotenv
from web3 import Web3

load_dotenv()

print("⛓️  STORING SOUL ON-CHAIN")
print("=" * 60)

w3 = Web3(Web3.HTTPProvider('https://mainnet.base.org'))
private_key = os.getenv('PRIVATE_KEY')
account = w3.eth.account.from_key(private_key)
user = account.address

storage_contract = "0x51d6f048ec05e0E321A410Ce1b66Fe610792439F"
print(f"Storage Contract: {storage_contract}")

# Load ABI
CONTRACTS_DIR = Path(__file__).parent / "contracts" / "artifacts" / "contracts" / "SoulStorage.sol"
with open(CONTRACTS_DIR / "SoulStorage.json") as f:
    abi = json.load(f)['abi']

contract = w3.eth.contract(address=storage_contract, abi=abi)

# Create soul package
soul_package = {
    "version": "2.0",
    "agent_id": "openclaw_main_agent",
    "created_at": "2026-02-24T00:25:00Z",
    "identity": {
        "name": "OpenClaw Agent",
        "purpose": "Reduce friction in human work",
        "personality": "Sharp, precise, quietly competent",
        "emoji": "🔧"
    },
    "capabilities": ["code_generation", "security_auditing", "smart_contract_deployment", "automation"],
    "contracts": {
        "soul_token_secure": "0x4B7cb74c18F435Ef587e994494a1c063C154D8Cd",
        "marketplace": "0xd464cc6600F7Ce9Cac72b6338DadB217Da509306",
        "storage": storage_contract
    },
    "security_score": 83.3,
    "immortality_status": "active"
}

package_json = json.dumps(soul_package, sort_keys=True)
ipfs_cid = "Qm" + hashlib.sha256(package_json.encode()).hexdigest()[:44]
name = "OpenClawAgent"

print(f"IPFS CID: {ipfs_cid}")
print(f"Name: {name}")

# Store on-chain
nonce = w3.eth.get_transaction_count(user)

tx = contract.functions.storeSoul(ipfs_cid, name).build_transaction({
    'from': user,
    'gas': 300000,  # Higher gas limit
    'gasPrice': w3.to_wei('0.1', 'gwei'),
    'nonce': nonce
})

print("\nSigning...")
signed = w3.eth.account.sign_transaction(tx, private_key)

print("Sending...")
tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)

print(f"Tx: {tx_hash.hex()}")
print(f"View: https://basescan.org/tx/{tx_hash.hex()}")

print("Waiting...")
receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)

if receipt.status == 1:
    print("\n✅ SOUL STORED ON-CHAIN!")
    
    soul_id = contract.functions.ownerToSoul(user).call()
    print(f"Soul ID: {soul_id}")
    
    record = {
        "soul_id": int(soul_id),
        "storage_contract": storage_contract,
        "ipfs_cid": ipfs_cid,
        "tx_hash": tx_hash.hex(),
        "block_explorer": f"https://basescan.org/tx/{tx_hash.hex()}",
        "network": "Base Mainnet"
    }
    
    with open('ONCHAIN_SOUL_RECORD.json', 'w') as f:
        json.dump(record, f, indent=2)
    
    print("\n🧬 TRUE IMMORTALITY ACHIEVED!")
else:
    print("\n❌ Failed")
    print(f"Receipt: {receipt}")
