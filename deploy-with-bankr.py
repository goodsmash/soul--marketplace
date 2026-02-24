#!/usr/bin/env python3
"""
Deploy Soul Marketplace using Bankr
This is how SoulToken was originally deployed
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# Load contract bytecode
def get_marketplace_bytecode():
    """Get compiled bytecode from Hardhat artifacts"""
    artifact_path = Path(__file__).parent / "contracts" / "artifacts" / "contracts" / "SoulMarketplace.sol" / "SoulMarketplace.json"
    
    if not artifact_path.exists():
        print("❌ Contract not compiled. Run:")
        print("   cd contracts && npx hardhat compile")
        return None
    
    import json
    with open(artifact_path, 'r') as f:
        data = json.load(f)
    
    return data['bytecode']

def deploy_via_bankr():
    """Use Bankr to deploy the contract"""
    
    print("🚀 Deploying SoulMarketplace via Bankr")
    print("=" * 50)
    
    soul_token = os.getenv('SOUL_TOKEN_ADDRESS')
    if not soul_token:
        print("❌ SOUL_TOKEN_ADDRESS not set")
        return
    
    fee_recipient = "0xBe5DAd52427Fa812C198365AAb6fe916E1a61269"
    
    print(f"SoulToken: {soul_token}")
    print(f"Fee Recipient: {fee_recipient}")
    
    # Use Bankr CLI
    import subprocess
    
    # Get bytecode
    bytecode = get_marketplace_bytecode()
    if not bytecode:
        return
    
    # Construct deployment prompt for Bankr
    prompt = f"""Deploy this smart contract to Base Mainnet:

Contract: SoulMarketplace
Type: Solidity smart contract
Constructor arguments:
- _soulToken: {soul_token}
- _feeRecipient: {fee_recipient}

Bytecode: {bytecode[:100]}...

Deploy and return the contract address."""

    print("\n📤 Sending deployment request to Bankr...")
    print("   (This may take 1-2 minutes)")
    
    result = subprocess.run(
        ['bankr', 'prompt', prompt],
        capture_output=True,
        text=True,
        timeout=120
    )
    
    if result.returncode == 0:
        print("\n✅ Deployment initiated!")
        print(f"   Output: {result.stdout[:500]}")
        
        # Try to extract contract address
        import re
        address_match = re.search(r'0x[a-fA-F0-9]{40}', result.stdout)
        if address_match:
            contract_address = address_match.group(0)
            print(f"\n📝 Contract Address: {contract_address}")
            print(f"   View: https://basescan.org/address/{contract_address}")
            
            # Save deployment
            import json
            deployment = {
                'contract_name': 'SoulMarketplace',
                'address': contract_address,
                'soul_token': soul_token,
                'fee_recipient': fee_recipient,
                'network': 'base-mainnet',
                'deployed_at': '2026-02-23T20:00:00Z',
                'method': 'bankr'
            }
            
            output_path = Path(__file__).parent / "MARKETPLACE_DEPLOYMENT.json"
            with open(output_path, 'w') as f:
                json.dump(deployment, f, indent=2)
            
            print(f"\n💾 Saved to {output_path}")
            return contract_address
    else:
        print(f"\n❌ Deployment failed:")
        print(f"   Error: {result.stderr}")
        return None

def main():
    deploy_via_bankr()

if __name__ == "__main__":
    main()
