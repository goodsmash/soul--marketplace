#!/usr/bin/env python3
"""
Test script for Soul Marketplace - verifies code works before real deployment
"""

import os
import sys
import json
import asyncio
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

def test_imports():
    """Test that all imports work"""
    print("Testing imports...")
    try:
        from cdp import CdpClient
        print("✅ CDP imports successful")
    except ImportError as e:
        print(f"❌ CDP import failed: {e}")
        return False
    
    try:
        from autonomous_agent import AutonomousSoulAgent, TIERS
        print("✅ Autonomous agent imports successful")
    except ImportError as e:
        print(f"❌ Autonomous agent import failed: {e}")
        return False
    
    return True

def test_tiers():
    """Test survival tier configuration"""
    print("\nTesting survival tiers...")
    from autonomous_agent import TIERS
    
    for name, tier in TIERS.items():
        print(f"  {tier.color} {name}: {tier.min_balance} - {tier.max_balance} ETH")
        print(f"    Actions: {', '.join(tier.actions[:2])}...")
    
    print("✅ All tiers configured")
    return True

def test_agent_creation():
    """Test agent initialization without CDP"""
    print("\nTesting agent creation...")
    from autonomous_agent import AutonomousSoulAgent
    
    # Create test agent
    agent = AutonomousSoulAgent("test_agent")
    
    print(f"  Agent ID: {agent.agent_id}")
    print(f"  Data dir: {agent.data_dir}")
    print(f"  Soul status: {agent.soul.get('status')}")
    print(f"  Capabilities: {len(agent.soul.get('capabilities', []))}")
    
    # Check files created
    files = list(agent.data_dir.glob(f"*{agent.agent_id}*"))
    print(f"  Files created: {len(files)}")
    for f in files:
        print(f"    - {f.name}")
    
    print("✅ Agent creation successful")
    return True

def test_soul_structure():
    """Test soul data structure"""
    print("\nTesting soul structure...")
    from autonomous_agent import AutonomousSoulAgent
    
    agent = AutonomousSoulAgent("test_agent_2")
    soul = agent.soul
    
    required_fields = ['agent_id', 'name', 'creature', 'birth_time', 'status', 'capabilities', 'marketplace']
    for field in required_fields:
        if field in soul:
            value = soul.get(field)
            if field == 'capabilities':
                print(f"  ✓ {field}: {len(value)} capabilities")
            elif field == 'marketplace':
                print(f"  ✓ {field}: present")
            else:
                print(f"  ✓ {field}: {value}")
        else:
            print(f"  ✗ Missing: {field}")
            return False
    
    print("✅ Soul structure valid")
    return True

async def test_without_cdp():
    """Test what we can without CDP keys"""
    print("\n" + "="*50)
    print("TESTING WITHOUT CDP KEYS")
    print("="*50)
    
    from autonomous_agent import AutonomousSoulAgent
    
    agent = AutonomousSoulAgent("test_no_cdp")
    
    # Test status without wallet
    status = agent.get_status()
    print(f"\nAgent Status:")
    print(f"  ID: {status['agent_id']}")
    print(f"  Wallet: {status['wallet_address']}")
    print(f"  Tier: {status['state']['current_tier']}")
    print(f"  Autonomous: {status['state']['autonomous_mode']}")
    
    # Test record work
    from decimal import Decimal
    await agent.record_work("test_task", Decimal("0.001"), "Testing the system")
    print(f"\n✅ Work recorded")
    print(f"   Total earnings: {agent.soul['total_earnings_eth']} ETH")
    print(f"   Work count: {agent.soul['lifetime_work_count']}")
    
    # Check history
    if agent.history_file.exists():
        with open(agent.history_file, 'r') as f:
            lines = f.readlines()
        print(f"\n✅ History logged: {len(lines)} events")
    
    return True

def test_contract_files():
    """Test that contract files exist"""
    print("\nTesting contract files...")
    
    contracts_dir = Path(__file__).parent / "contracts"
    required = ['SoulToken.sol', 'SoulMarketplace.sol', 'SoulStaking.sol', 'deploy.js']
    
    for file in required:
        path = contracts_dir / file
        if path.exists():
            size = path.stat().st_size
            print(f"  ✓ {file} ({size} bytes)")
        else:
            print(f"  ✗ Missing: {file}")
            return False
    
    print("✅ All contract files present")
    return True

def main():
    print("="*50)
    print("SOUL MARKETPLACE - CODE VERIFICATION")
    print("="*50)
    
    tests = [
        ("Imports", test_imports),
        ("Tiers", test_tiers),
        ("Agent Creation", test_agent_creation),
        ("Soul Structure", test_soul_structure),
        ("Contract Files", test_contract_files),
    ]
    
    passed = 0
    failed = 0
    
    for name, test_func in tests:
        try:
            if test_func():
                passed += 1
            else:
                failed += 1
                print(f"❌ {name} failed")
        except Exception as e:
            failed += 1
            print(f"❌ {name} error: {e}")
            import traceback
            traceback.print_exc()
    
    # Async test
    try:
        asyncio.run(test_without_cdp())
        passed += 1
    except Exception as e:
        failed += 1
        print(f"❌ Async test error: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "="*50)
    print(f"RESULTS: {passed} passed, {failed} failed")
    print("="*50)
    
    if failed == 0:
        print("\n✅ ALL TESTS PASSED!")
        print("\nNext steps:")
        print("1. Add CDP API keys to .env file")
        print("2. Run: python3 orchestrator.py fund")
        print("3. Fund the wallet address shown")
        print("4. Run: python3 orchestrator.py run")
    else:
        print("\n⚠️  Some tests failed. Fix issues before proceeding.")
    
    return failed == 0

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
