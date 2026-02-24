#!/usr/bin/env python3
"""
Debug the on-chain storage
"""

import os
import json
from pathlib import Path
from dotenv import load_dotenv
from web3 import Web3

load_dotenv()

w3 = Web3(Web3.HTTPProvider('https://mainnet.base.org'))
private_key = os.getenv('PRIVATE_KEY')
account = w3.eth.account.from_key(private_key)
user = account.address

storage_contract = "0x51d6f048ec05e0E321A410Ce1b66Fe610792439F"

# Load ABI
CONTRACTS_DIR = Path(__file__).parent / "contracts" / "artifacts" / "contracts" / "SoulStorage.sol"
with open(CONTRACTS_DIR / "SoulStorage.json") as f:
    abi = json.load(f)['abi']

contract = w3.eth.contract(address=storage_contract, abi=abi)

# Try to estimate gas first
ipfs_cid = "Qmbe812a091805a423dca49ef03e1208fdfdac1a059633"
name = "OpenClaw Agent"

try:
    gas_estimate = contract.functions.storeSoul(ipfs_cid, name).estimate_gas({
        'from': user
    })
    print(f"Gas estimate: {gas_estimate}")
except Exception as e:
    print(f"Gas estimation failed: {e}")
    
# Check if soul exists
soul_id = contract.functions.ownerToSoul(user).call()
print(f"Existing soul ID: {soul_id}")

# Check contract details
print(f"Total souls: {contract.functions.totalSouls().call()}")
print(f"Contract owner: {contract.functions.owner().call()}")
