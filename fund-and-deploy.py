#!/usr/bin/env python3
"""
Fund deployer and deploy on Base Sepolia (cheaper)
"""

import asyncio
import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

# Add CDP SDK path
sys.path.insert(0, str(Path.home() / ".openclaw" / "skills" / "soul-marketplace" / "src"))

from cdp import CdpClient
from web3 import Web3

async def fund_and_deploy():
    """Fund deployer from CDP wallet, then deploy on Sepolia"""
    
    print("🚀 Funding Deployer & Deploying on Base Sepolia")
    print("=" * 60)
    
    # Initialize CDP
    cdp = CdpClient(
        api_key_id=os.getenv("CDP_API_KEY_ID"),
        api_key_secret=os.getenv("CDP_API_KEY_SECRET"),
        wallet_secret=os.getenv("CDP_WALLET_SECRET")
    )
    
    # Addresses
    cdp_address = "0xBe5DAd52427Fa812C198365AAb6fe916E1a61269"
    deployer = "0xff310EDf4f8d2F7FBc4EfD09D1E7D5Ab0E2D2131"
    
    print(f"\n📍 CDP Wallet: {cdp_address}")
    print(f"📍 Deployer: {deployer}")
    
    # Connect to Base Sepolia
    w3 = Web3(Web3.HTTPProvider('https://sepolia.base.org'))
    print(f"\n🔗 Connected to Base Sepolia")
    print(f"   Chain ID: {w3.eth.chain_id}")
    
    # Check CDP balance on Sepolia
    # Note: CDP wallet might not have Sepolia ETH, need to get from faucet
    
    print("\n⚠️  IMPORTANT:")
    print("   CDP wallet needs Base Sepolia ETH")
    print("   Get free ETH from: https://www.coinbase.com/faucets/base-sepolia-faucet")
    print(f"   Send to: {cdp_address}")
    
    print("\n💡 Alternative: Use local Hardhat network for testing")
    print("   npx hardhat node")
    print("   npx hardhat run deploy-marketplace.js --network localhost")

if __name__ == "__main__":
    import sys
    asyncio.run(fund_and_deploy())
