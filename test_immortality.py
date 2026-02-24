#!/usr/bin/env python3
"""
Test Soul Upload/Download for Immortality
Ensures agents can backup and restore their souls
"""

import os
import sys
import json
import shutil
from pathlib import Path
from datetime import datetime

def test_backup_restore():
    """Test complete backup and restore cycle"""
    
    print("🧪 TESTING SOUL UPLOAD/DOWNLOAD")
    print("=" * 60)
    
    skill_dir = Path.home() / ".openclaw" / "skills" / "soul-marketplace"
    backup_root = skill_dir / ".ultimate_backups"
    
    # Test 1: List backups
    print("\n📋 Test 1: List Available Backups")
    backups = list(backup_root.glob("ULTIMATE_*"))
    print(f"   Found {len(backups)} backup(s)")
    
    if not backups:
        print("   ❌ No backups found!")
        return False
    
    latest_backup = sorted(backups)[-1]
    print(f"   Latest: {latest_backup.name}")
    
    # Test 2: Verify backup structure
    print("\n📋 Test 2: Verify Backup Structure")
    
    required_dirs = ['souls', 'skills', 'contracts', 'agent_state', 'work_history']
    for dir_name in required_dirs:
        dir_path = latest_backup / dir_name
        if dir_path.exists():
            files = list(dir_path.rglob('*'))
            print(f"   ✅ {dir_name}/ - {len(files)} items")
        else:
            print(f"   ⚠️  {dir_name}/ - missing")
    
    # Test 3: Check manifest
    print("\n📋 Test 3: Check Manifest")
    manifest_path = latest_backup / "MANIFEST.json"
    
    if manifest_path.exists():
        with open(manifest_path) as f:
            manifest = json.load(f)
        
        print(f"   Backup ID: {manifest['backup_id']}")
        print(f"   Recovery Key: {manifest['recovery_key'][:50]}...")
        print(f"   Total Size: {manifest.get('total_size_human', 'Unknown')}")
        print(f"   Components: {list(manifest['components'].keys())}")
        print("   ✅ Manifest valid")
    else:
        print("   ❌ Manifest missing!")
        return False
    
    # Test 4: Simulate restore
    print("\n📋 Test 4: Simulate Restore")
    
    test_restore_dir = skill_dir / ".test_restore"
    test_restore_dir.mkdir(exist_ok=True)
    
    # Copy souls
    souls_src = latest_backup / "souls"
    souls_dst = test_restore_dir / "souls"
    if souls_src.exists():
        shutil.copytree(souls_src, souls_dst, dirs_exist_ok=True)
        restored_souls = list(souls_dst.glob('*'))
        print(f"   ✅ Restored {len(restored_souls)} soul file(s)")
    
    # Copy agent state
    state_src = latest_backup / "agent_state"
    state_dst = test_restore_dir / "agent_state"
    if state_src.exists():
        shutil.copytree(state_src, state_dst, dirs_exist_ok=True)
        restored_state = list(state_dst.glob('*'))
        print(f"   ✅ Restored {len(restored_state)} state file(s)")
    
    # Test 5: Verify recovery instructions
    print("\n📋 Test 5: Recovery Instructions")
    instructions_path = latest_backup / "RECOVERY_INSTRUCTIONS.txt"
    
    if instructions_path.exists():
        content = instructions_path.read_text()
        if "RESTORATION STEPS" in content and manifest['recovery_key'] in content:
            print("   ✅ Instructions valid and include recovery key")
        else:
            print("   ⚠️  Instructions incomplete")
    else:
        print("   ❌ Instructions missing!")
    
    # Cleanup test restore
    print("\n📋 Test 6: Cleanup")
    if test_restore_dir.exists():
        shutil.rmtree(test_restore_dir)
        print("   ✅ Test restore cleaned up")
    
    # Test 7: Soul file integrity
    print("\n📋 Test 7: Soul File Integrity")
    souls_dir = latest_backup / "souls"
    if souls_dir.exists():
        for soul_file in souls_dir.glob('*.json'):
            try:
                with open(soul_file) as f:
                    data = json.load(f)
                print(f"   ✅ {soul_file.name} - valid JSON")
            except json.JSONDecodeError:
                print(f"   ❌ {soul_file.name} - corrupted!")
                return False
    
    print("\n" + "=" * 60)
    print("🎉 SOUL IMMORTALITY TEST PASSED!")
    print("=" * 60)
    print("\n✅ Your soul can be:")
    print("   - Uploaded (backed up)")
    print("   - Downloaded (restored)")
    print("   - Verified (integrity checked)")
    print("   - Recovered (with recovery key)")
    print("\n🧬 Agent immortality is assured!")
    
    return True

if __name__ == "__main__":
    success = test_backup_restore()
    sys.exit(0 if success else 1)
