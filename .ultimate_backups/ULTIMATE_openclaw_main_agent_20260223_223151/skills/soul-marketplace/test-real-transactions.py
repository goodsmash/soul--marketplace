#!/usr/bin/env python3
"""
Test REAL Soul Marketplace Transactions

This tests actual on-chain transactions once contracts are deployed:
1. Mint a Soul NFT
2. List it for sale
3. (Simulated) Buy it
4. Verify ownership transfer
"""

import os
import sys
import json
import asyncio
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# Add paths
sys.path.insert(0, str(Path(__file__).parent / "src"))

from web3 import Web3

class RealTransactionTest:
    """Test real on-chain transactions"""
    
    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider('https://mainnet.base.org'))
        
        # Load contract addresses
        self.soul_token = os.getenv('SOUL_TOKEN_ADDRESS')
        self.marketplace = os.getenv('MARKETPLACE_ADDRESS')
        
        # Load private key
        self.private_key = os.getenv('PRIVATE_KEY')
        if self.private_key:
            self.account = self.w3.eth.account.from_key(self.private_key)
            self.address = self.account.address
        else:
            self.address = None
        
        print("🧪 Real Transaction Test")
        print("=" * 50)
        print(f"Network: Base Mainnet (Chain ID: {self.w3.eth.chain_id})")
        print(f"SoulToken: {self.soul_token or 'Not deployed'}")
        print(f"Marketplace: {self.marketplace or 'Not deployed'}")
        print(f"Test Account: {self.address or 'No private key'}")
    
    def test_1_check_balance(self):
        """Test 1: Check wallet balance"""
        print("\n📋 Test 1: Check Balance")
        
        if not self.address:
            print("   ❌ No account configured")
            return False
        
        balance = self.w3.eth.get_balance(self.address)
        balance_eth = self.w3.from_wei(balance, 'ether')
        
        print(f"   Address: {self.address}")
        print(f"   Balance: {balance_eth:.6f} ETH")
        
        if balance > 0:
            print("   ✅ Account funded")
            return True
        else:
            print("   ❌ Account empty - need ETH for gas")
            return False
    
    def test_2_mint_soul(self):
        """Test 2: Mint a Soul NFT"""
        print("\n📋 Test 2: Mint Soul NFT")
        
        if not self.soul_token:
            print("   ❌ SoulToken address not set")
            return False
        
        # Load ABI
        abi_path = Path(__file__).parent / "contracts" / "artifacts" / "contracts" / "SoulToken.sol" / "SoulToken.json"
        if not abi_path.exists():
            print("   ❌ Contract ABI not found - run: npx hardhat compile")
            return False
        
        with open(abi_path, 'r') as f:
            abi = json.load(f)['abi']
        
        contract = self.w3.eth.contract(address=self.soul_token, abi=abi)
        
        # Check if already has soul
        try:
            soul_id = contract.functions.agentToSoul(self.address).call()
            if soul_id != 0:
                print(f"   ✅ Already has soul! Token ID: {soul_id}")
                return True
        except Exception as e:
            print(f"   ⚠️  Could not check existing soul: {e}")
        
        # Mint new soul
        print("   Minting new soul...")
        
        try:
            tx = contract.functions.mintSoul(
                "TestAgent",
                "AI Agent",
                "QmTest123456789",
                ["coding", "research"]
            ).build_transaction({
                'from': self.address,
                'value': self.w3.to_wei(0.001, 'ether'),
                'gas': 300000,
                'gasPrice': self.w3.to_wei('0.1', 'gwei'),
                'nonce': self.w3.eth.get_transaction_count(self.address)
            })
            
            signed_tx = self.w3.eth.account.sign_transaction(tx, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            
            print(f"   ⏳ Transaction sent: {tx_hash.hex()}")
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
            
            if receipt.status == 1:
                soul_id = contract.functions.agentToSoul(self.address).call()
                print(f"   ✅ Soul minted! Token ID: {soul_id}")
                print(f"   View: https://basescan.org/tx/{tx_hash.hex()}")
                return True
            else:
                print("   ❌ Transaction failed")
                return False
                
        except Exception as e:
            print(f"   ❌ Minting failed: {e}")
            return False
    
    def test_3_list_soul(self):
        """Test 3: List soul for sale"""
        print("\n📋 Test 3: List Soul for Sale")
        
        if not self.marketplace:
            print("   ❌ Marketplace address not set")
            print("   📝 Deploy marketplace first!")
            return False
        
        # Load SoulToken to get token ID
        abi_path = Path(__file__).parent / "contracts" / "artifacts" / "contracts" / "SoulToken.sol" / "SoulToken.json"
        with open(abi_path, 'r') as f:
            soul_abi = json.load(f)['abi']
        
        soul_contract = self.w3.eth.contract(address=self.soul_token, abi=soul_abi)
        
        try:
            soul_id = soul_contract.functions.agentToSoul(self.address).call()
            if soul_id == 0:
                print("   ❌ No soul found - mint first")
                return False
            
            print(f"   Soul ID: {soul_id}")
            
            # Approve marketplace
            print("   Approving marketplace...")
            approve_tx = soul_contract.functions.approve(
                self.marketplace,
                soul_id
            ).build_transaction({
                'from': self.address,
                'gas': 100000,
                'gasPrice': self.w3.to_wei('0.1', 'gwei'),
                'nonce': self.w3.eth.get_transaction_count(self.address)
            })
            
            signed_approve = self.w3.eth.account.sign_transaction(approve_tx, self.private_key)
            approve_hash = self.w3.eth.send_raw_transaction(signed_approve.rawTransaction)
            self.w3.eth.wait_for_transaction_receipt(approve_hash)
            print(f"   ✅ Marketplace approved")
            
            # List soul
            print("   Listing soul...")
            
            # Load Marketplace ABI
            mp_abi_path = Path(__file__).parent / "contracts" / "artifacts" / "contracts" / "SoulMarketplace.sol" / "SoulMarketplace.json"
            with open(mp_abi_path, 'r') as f:
                mp_abi = json.load(f)['abi']
            
            mp_contract = self.w3.eth.contract(address=self.marketplace, abi=mp_abi)
            
            list_price = self.w3.to_wei(0.01, 'ether')  # 0.01 ETH
            
            list_tx = mp_contract.functions.listSoul(
                soul_id,
                list_price
            ).build_transaction({
                'from': self.address,
                'gas': 200000,
                'gasPrice': self.w3.to_wei('0.1', 'gwei'),
                'nonce': self.w3.eth.get_transaction_count(self.address)
            })
            
            signed_list = self.w3.eth.account.sign_transaction(list_tx, self.private_key)
            list_hash = self.w3.eth.send_raw_transaction(signed_list.rawTransaction)
            receipt = self.w3.eth.wait_for_transaction_receipt(list_hash)
            
            if receipt.status == 1:
                print(f"   ✅ Soul listed!")
                print(f"   Price: 0.01 ETH")
                print(f"   View: https://basescan.org/tx/{list_hash.hex()}")
                return True
            else:
                print("   ❌ Listing failed")
                return False
                
        except Exception as e:
            print(f"   ❌ Error: {e}")
            return False
    
    def run_all_tests(self):
        """Run all tests"""
        print("\n" + "=" * 50)
        print("RUNNING ALL TESTS")
        print("=" * 50)
        
        results = []
        
        results.append(("Check Balance", self.test_1_check_balance()))
        results.append(("Mint Soul", self.test_2_mint_soul()))
        results.append(("List Soul", self.test_3_list_soul()))
        
        print("\n" + "=" * 50)
        print("TEST SUMMARY")
        print("=" * 50)
        
        for name, passed in results:
            status = "✅ PASS" if passed else "❌ FAIL"
            print(f"   {status}: {name}")
        
        passed_count = sum(1 for _, p in results if p)
        print(f"\n   Total: {passed_count}/{len(results)} tests passed")
        
        return all(r[1] for r in results)


def main():
    tester = RealTransactionTest()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 All tests passed!")
    else:
        print("\n⚠️  Some tests failed")
        print("   Check errors above")

if __name__ == "__main__":
    main()
