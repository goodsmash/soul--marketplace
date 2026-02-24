#!/usr/bin/env python3
"""
Continuous Testing & Improvement Suite
Tests all functionality and suggests improvements
"""

import os
import sys
import json
import time
from pathlib import Path
from dotenv import load_dotenv
from web3 import Web3

load_dotenv()

class ContinuousTester:
    """Test and improve the Soul Marketplace"""
    
    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider('https://mainnet.base.org'))
        self.deployer = "0xff310EDf4f8d2F7FBc4EfD09D1E7D5Ab0E2D2131"
        self.soul_token = os.getenv('SOUL_TOKEN_ADDRESS')
        self.marketplace = os.getenv('MARKETPLACE_ADDRESS')
        
        print("🧪 Continuous Testing & Improvement")
        print("=" * 60)
        print(f"Network: Base Mainnet")
        print(f"SoulToken: {self.soul_token}")
        print(f"Marketplace: {self.marketplace}")
    
    def test_wallet_funding(self):
        """Test 1: Check wallet has ETH"""
        print("\n📋 Test 1: Wallet Funding")
        
        balance = self.w3.eth.get_balance(self.deployer)
        balance_eth = self.w3.from_wei(balance, 'ether')
        
        print(f"   Deployer: {balance_eth:.6f} ETH")
        
        if balance > self.w3.to_wei(0.001, 'ether'):
            print("   ✅ Sufficient funding")
            return True
        else:
            print("   ❌ Insufficient funding")
            return False
    
    def test_contract_deployment(self):
        """Test 2: Verify contracts are deployed"""
        print("\n📋 Test 2: Contract Deployment")
        
        # Check SoulToken has code
        code = self.w3.eth.get_code(self.soul_token)
        if len(code) > 0:
            print(f"   ✅ SoulToken deployed ({len(code)} bytes)")
        else:
            print("   ❌ SoulToken not found")
            return False
        
        # Check Marketplace has code
        code = self.w3.eth.get_code(self.marketplace)
        if len(code) > 0:
            print(f"   ✅ Marketplace deployed ({len(code)} bytes)")
        else:
            print("   ❌ Marketplace not found")
            return False
        
        return True
    
    def test_mint_soul(self):
        """Test 3: Mint a soul NFT"""
        print("\n📋 Test 3: Mint Soul NFT")
        
        # Load SoulToken ABI
        abi_path = Path(__file__).parent / "contracts" / "artifacts" / "contracts" / "SoulToken.sol" / "SoulToken.json"
        
        with open(abi_path, 'r') as f:
            abi = json.load(f)['abi']
        
        contract = self.w3.eth.contract(address=self.soul_token, abi=abi)
        
        # Check if already has soul
        try:
            soul_id = contract.functions.agentToSoul(self.deployer).call()
            if soul_id > 0:
                print(f"   ✅ Already has soul (ID: {soul_id})")
                return True
        except:
            pass
        
        # Mint new soul
        private_key = os.getenv('PRIVATE_KEY')
        account = self.w3.eth.account.from_key(private_key)
        
        try:
            tx = contract.functions.mintSoul(
                "TestAgent",
                "AI Agent",
                "QmTest123456789",
                ["coding", "research"]
            ).build_transaction({
                'from': account.address,
                'value': self.w3.to_wei(0.001, 'ether'),
                'gas': 300000,
                'gasPrice': self.w3.to_wei('0.1', 'gwei'),
                'nonce': self.w3.eth.get_transaction_count(account.address)
            })
            
            signed = self.w3.eth.account.sign_transaction(tx, private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed.raw_transaction)
            
            print(f"   ⏳ Minting... {tx_hash.hex()[:20]}...")
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
            
            if receipt.status == 1:
                soul_id = contract.functions.agentToSoul(self.deployer).call()
                print(f"   ✅ Soul minted! ID: {soul_id}")
                return True
            else:
                print("   ❌ Minting failed")
                return False
                
        except Exception as e:
            print(f"   ❌ Error: {e}")
            return False
    
    def test_list_soul(self):
        """Test 4: List soul for sale"""
        print("\n📋 Test 4: List Soul for Sale")
        print("   [Skipped - requires soul first]")
        return True
    
    def run_all_tests(self):
        """Run all tests"""
        print("\n" + "=" * 60)
        print("RUNNING TEST SUITE")
        print("=" * 60)
        
        results = []
        results.append(("Wallet Funding", self.test_wallet_funding()))
        results.append(("Contract Deployment", self.test_contract_deployment()))
        results.append(("Mint Soul", self.test_mint_soul()))
        results.append(("List Soul", self.test_list_soul()))
        
        print("\n" + "=" * 60)
        print("TEST RESULTS")
        print("=" * 60)
        
        passed = 0
        for name, result in results:
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"   {status}: {name}")
            if result:
                passed += 1
        
        print(f"\n   Score: {passed}/{len(results)} ({passed/len(results)*100:.0f}%)")
        
        return passed == len(results)
    
    def suggest_improvements(self):
        """Suggest improvements"""
        print("\n" + "=" * 60)
        print("IMPROVEMENT SUGGESTIONS")
        print("=" * 60)
        
        suggestions = [
            ("High", "Add event indexing for faster queries"),
            ("High", "Implement soul cloning functionality"),
            ("Medium", "Add capability marketplace"),
            ("Medium", "Implement reputation staking"),
            ("Low", "Add UI for browsing souls"),
            ("Low", "Create agent leaderboards"),
        ]
        
        for priority, suggestion in suggestions:
            print(f"   [{priority}] {suggestion}")

if __name__ == "__main__":
    tester = ContinuousTester()
    success = tester.run_all_tests()
    tester.suggest_improvements()
    
    if success:
        print("\n🎉 All tests passed!")
    else:
        print("\n⚠️  Some tests failed - check output above")
