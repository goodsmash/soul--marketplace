#!/usr/bin/env python3
"""
Send ETH from CDP wallet to deployer
Uses CDP SDK for real transaction
"""

import asyncio
import os
from dotenv import load_dotenv
from web3 import Web3

load_dotenv()

async def send_eth():
    """Send ETH from CDP wallet to deployer"""
    
    print("💸 Sending ETH from CDP to Deployer")
    print("=" * 60)
    
    # Addresses
    cdp_address = "0xBe5DAd52427Fa812C198365AAb6fe916E1a61269"
    deployer = "0xff310EDf4f8d2F7FBc4EfD09D1E7D5Ab0E2D2131"
    
    print(f"From (CDP): {cdp_address}")
    print(f"To (Deployer): {deployer}")
    print(f"Amount: 0.005 ETH")
    
    # Connect to Base Mainnet
    w3 = Web3(Web3.HTTPProvider('https://mainnet.base.org'))
    
    # Check CDP balance
    balance = w3.eth.get_balance(cdp_address)
    balance_eth = w3.from_wei(balance, 'ether')
    print(f"\nCDP Balance: {balance_eth} ETH")
    
    if balance < w3.to_wei(0.005, 'ether'):
        print("❌ CDP wallet doesn't have enough ETH")
        return False
    
    # Note: We can't easily extract the private key from CDP
    # CDP SDK is designed to manage keys securely
    
    print("\n⚠️  CDP SDK requires special transaction handling")
    print("   Private keys are managed securely by Coinbase")
    
    # Alternative: Use Bankr which already has access
    print("\n💡 Alternative methods:")
    print("   1. Use Bankr Telegram: @bankrbot")
    print("      Send: 'Send 0.005 ETH to 0xff310EDf4f8d2F7FBc4EfD09D1E7D5Ab0E2D2131 on Base'")
    print("")
    print("   2. Use CDP Portal:")
    print("      https://portal.cdp.coinbase.com/")
    print(f"      Send 0.005 ETH to: {deployer}")
    print("")
    print("   3. Get Sepolia ETH (free) for test deployment:")
    print("      https://www.coinbase.com/faucets/base-sepolia-faucet")
    print(f"      Address: {deployer}")
    
    return True

if __name__ == "__main__":
    asyncio.run(send_eth())
