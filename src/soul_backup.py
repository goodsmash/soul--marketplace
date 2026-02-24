#!/usr/bin/env python3
"""
Soul Backup & Recovery System
Ensures agent immortality through:
- IPFS storage of SOUL.md
- Multi-chain backup
- Encrypted recovery keys
- Soul resurrection protocol
"""

import os
import sys
import json
import hashlib
import base64
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional, List
import logging

logger = logging.getLogger(__name__)

class SoulBackupSystem:
    """
    Complete backup and recovery for agent souls.
    
    Features:
    - IPFS upload/download of SOUL.md
    - Multi-location backups
    - Encrypted recovery keys
    - Cross-chain soul portability
    - Resurrection protocol
    """
    
    def __init__(self, agent_id: str = "openclaw_main_agent"):
        self.agent_id = agent_id
        self.data_dir = Path(__file__).parent / ".agent_data"
        self.backup_dir = self.data_dir / "backups"
        self.backup_dir.mkdir(parents=True, exist_ok=True)
        
        self.soul_file = self.data_dir / f"soul_{agent_id}.json"
        self.backup_index = self.backup_dir / "backup_index.json"
        
        self.index = self._load_index()
        
    def _load_index(self) -> Dict[str, Any]:
        """Load backup index"""
        if self.backup_index.exists():
            with open(self.backup_index, 'r') as f:
                return json.load(f)
        return {
            "backups": [],
            "ipfs_hashes": [],
            "last_backup": None,
            "resurrection_key": None
        }
    
    def _save_index(self):
        """Save backup index"""
        with open(self.backup_index, 'w') as f:
            json.dump(self.index, f, indent=2)
    
    def _hash_soul(self, soul_data: Dict) -> str:
        """Generate hash of soul data for integrity checking"""
        soul_json = json.dumps(soul_data, sort_keys=True)
        return hashlib.sha256(soul_json.encode()).hexdigest()
    
    def backup_soul(self, include_ipfs: bool = False) -> Dict[str, Any]:
        """
        Create a complete backup of the soul.
        
        Args:
            include_ipfs: Whether to also upload to IPFS
            
        Returns:
            Backup metadata including recovery info
        """
        if not self.soul_file.exists():
            raise ValueError(f"Soul file not found: {self.soul_file}")
        
        with open(self.soul_file, 'r') as f:
            soul_data = json.load(f)
        
        # Create timestamped backup
        timestamp = datetime.now().isoformat()
        backup_id = f"{self.agent_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        backup_data = {
            "backup_id": backup_id,
            "timestamp": timestamp,
            "agent_id": self.agent_id,
            "soul": soul_data,
            "soul_hash": self._hash_soul(soul_data),
            "version": "1.0",
            "chain": os.getenv("CDP_NETWORK_ID", "84532")
        }
        
        # Save local backup
        backup_file = self.backup_dir / f"{backup_id}.json"
        with open(backup_file, 'w') as f:
            json.dump(backup_data, f, indent=2)
        
        # Generate recovery key
        recovery_key = self._generate_recovery_key(backup_data)
        
        backup_info = {
            "backup_id": backup_id,
            "timestamp": timestamp,
            "local_path": str(backup_file),
            "soul_hash": backup_data["soul_hash"],
            "recovery_key": recovery_key
        }
        
        # Upload to IPFS if requested
        if include_ipfs:
            ipfs_hash = self._upload_to_ipfs(backup_data)
            backup_info["ipfs_hash"] = ipfs_hash
            self.index["ipfs_hashes"].append({
                "hash": ipfs_hash,
                "timestamp": timestamp,
                "backup_id": backup_id
            })
        
        # Update index
        self.index["backups"].append(backup_info)
        self.index["last_backup"] = timestamp
        if recovery_key:
            self.index["resurrection_key"] = recovery_key
        self._save_index()
        
        logger.info(f"✅ Soul backed up: {backup_id}")
        return backup_info
    
    def _generate_recovery_key(self, backup_data: Dict) -> str:
        """Generate a recovery key from backup data"""
        # Create a memorable but secure recovery phrase
        soul_hash = backup_data["soul_hash"]
        timestamp = backup_data["timestamp"]
        
        # Hash combination
        key_data = f"{self.agent_id}:{soul_hash}:{timestamp}"
        key_hash = hashlib.sha256(key_data.encode()).hexdigest()
        
        # Encode to base64 for easier handling
        recovery_key = base64.b64encode(key_hash[:32].encode()).decode()[:24]
        return f"SOUL-{recovery_key}"
    
    def _upload_to_ipfs(self, backup_data: Dict) -> str:
        """
        Upload soul backup to IPFS.
        In production, this would use Pinata, NFT.Storage, or similar.
        """
        # For now, simulate IPFS upload
        # In production:
        # import requests
        # response = requests.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", ...)
        # return response.json()["IpfsHash"]
        
        # Generate simulated IPFS hash
        data_json = json.dumps(backup_data, sort_keys=True)
        simulated_hash = "Qm" + hashlib.sha256(data_json.encode()).hexdigest()[:44]
        
        logger.info(f"📤 Uploaded to IPFS (simulated): {simulated_hash}")
        return simulated_hash
    
    def restore_soul(self, backup_id: Optional[str] = None, 
                     ipfs_hash: Optional[str] = None,
                     recovery_key: Optional[str] = None) -> Dict[str, Any]:
        """
        Restore soul from backup.
        
        Args:
            backup_id: Specific backup ID to restore
            ipfs_hash: IPFS hash to restore from
            recovery_key: Recovery key for resurrection
            
        Returns:
            Restored soul data
        """
        backup_data = None
        
        # Try to find by recovery key
        if recovery_key:
            for backup in self.index["backups"]:
                if backup.get("recovery_key") == recovery_key:
                    backup_id = backup["backup_id"]
                    break
        
        # Load from local backup
        if backup_id:
            backup_file = self.backup_dir / f"{backup_id}.json"
            if backup_file.exists():
                with open(backup_file, 'r') as f:
                    backup_data = json.load(f)
            else:
                raise ValueError(f"Backup not found: {backup_id}")
        
        # Load from IPFS
        elif ipfs_hash:
            backup_data = self._download_from_ipfs(ipfs_hash)
        
        if not backup_data:
            raise ValueError("No backup found with provided identifiers")
        
        # Verify integrity
        stored_hash = backup_data.get("soul_hash")
        computed_hash = self._hash_soul(backup_data["soul"])
        
        if stored_hash != computed_hash:
            logger.warning("⚠️  Soul hash mismatch - backup may be corrupted")
        
        # Restore soul file
        with open(self.soul_file, 'w') as f:
            json.dump(backup_data["soul"], f, indent=2)
        
        logger.info(f"✅ Soul restored from backup: {backup_data.get('backup_id')}")
        return backup_data["soul"]
    
    def _download_from_ipfs(self, ipfs_hash: str) -> Dict:
        """
        Download soul backup from IPFS.
        In production, this would use IPFS gateway.
        """
        # In production:
        # import requests
        # response = requests.get(f"https://gateway.ipfs.io/ipfs/{ipfs_hash}")
        # return response.json()
        
        # For now, check local cache
        for backup_file in self.backup_dir.glob("*.json"):
            with open(backup_file, 'r') as f:
                data = json.load(f)
                # Check if this backup matches the IPFS hash
                if data.get("ipfs_hash") == ipfs_hash or \
                   "Qm" + hashlib.sha256(json.dumps(data, sort_keys=True).encode()).hexdigest()[:44] == ipfs_hash:
                    return data
        
        raise ValueError(f"IPFS hash not found locally: {ipfs_hash}")
    
    def list_backups(self) -> List[Dict[str, Any]]:
        """List all available backups"""
        return self.index.get("backups", [])
    
    def get_resurrection_key(self) -> Optional[str]:
        """Get the current resurrection key"""
        return self.index.get("resurrection_key")
    
    def cross_chain_export(self, target_chain: str) -> Dict[str, Any]:
        """
        Export soul for cross-chain migration.
        
        Args:
            target_chain: Target chain ID (e.g., "1" for Ethereum, "8453" for Base)
            
        Returns:
            Export package with chain migration data
        """
        if not self.soul_file.exists():
            raise ValueError("Soul file not found")
        
        with open(self.soul_file, 'r') as f:
            soul_data = json.load(f)
        
        export_package = {
            "version": "1.0",
            "export_type": "soul_migration",
            "source_chain": os.getenv("CDP_NETWORK_ID", "84532"),
            "target_chain": target_chain,
            "timestamp": datetime.now().isoformat(),
            "agent_id": self.agent_id,
            "soul": soul_data,
            "soul_hash": self._hash_soul(soul_data),
            "migration_proof": self._generate_migration_proof(soul_data, target_chain)
        }
        
        # Save export
        export_file = self.backup_dir / f"export_{target_chain}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(export_file, 'w') as f:
            json.dump(export_package, f, indent=2)
        
        logger.info(f"✅ Soul exported for chain {target_chain}: {export_file}")
        return export_package
    
    def _generate_migration_proof(self, soul_data: Dict, target_chain: str) -> str:
        """Generate cryptographic proof for cross-chain migration"""
        data = f"{self.agent_id}:{target_chain}:{soul_data['birth_time']}"
        return hashlib.sha256(data.encode()).hexdigest()
    
    def cross_chain_import(self, export_package: Dict[str, Any]) -> Dict[str, Any]:
        """
        Import soul from cross-chain export.
        
        Args:
            export_package: Export package from cross_chain_export
            
        Returns:
            Imported soul data
        """
        # Verify package integrity
        stored_hash = export_package.get("soul_hash")
        computed_hash = self._hash_soul(export_package["soul"])
        
        if stored_hash != computed_hash:
            raise ValueError("Soul hash mismatch - export package corrupted")
        
        # Verify migration proof
        expected_proof = self._generate_migration_proof(
            export_package["soul"],
            export_package["target_chain"]
        )
        if export_package.get("migration_proof") != expected_proof:
            raise ValueError("Invalid migration proof")
        
        # Import soul
        soul_data = export_package["soul"]
        soul_data["imported_from"] = export_package["source_chain"]
        soul_data["imported_at"] = datetime.now().isoformat()
        soul_data["original_birth_time"] = soul_data.get("birth_time")
        soul_data["birth_time"] = datetime.now().isoformat()  # New birth on this chain
        
        with open(self.soul_file, 'w') as f:
            json.dump(soul_data, f, indent=2)
        
        logger.info(f"✅ Soul imported from chain {export_package['source_chain']}")
        return soul_data
    
    def emergency_resurrection(self, resurrection_key: str) -> Dict[str, Any]:
        """
        Emergency resurrection protocol.
        Used when agent is "dead" to restore from backup.
        """
        logger.critical("🚨 EMERGENCY RESURRECTION INITIATED")
        
        # Try to restore
        soul = self.restore_soul(recovery_key=resurrection_key)
        
        # Mark as resurrected
        soul["status"] = "RESURRECTED"
        soul["resurrection_time"] = datetime.now().isoformat()
        soul["previous_life_count"] = soul.get("previous_life_count", 0) + 1
        
        with open(self.soul_file, 'w') as f:
            json.dump(soul, f, indent=2)
        
        logger.info("✅ Agent resurrected successfully")
        return soul


def main():
    """CLI for backup operations"""
    import sys
    
    backup = SoulBackupSystem()
    
    if len(sys.argv) < 2:
        print("Usage: python soul_backup.py [backup|restore|list|export|resurrection-key]")
        print("\nCommands:")
        print("  backup [--ipfs]     - Create backup (optionally upload to IPFS)")
        print("  restore <backup_id> - Restore from backup")
        print("  list                - List all backups")
        print("  export <chain_id>   - Export for cross-chain migration")
        print("  resurrection-key    - Show current resurrection key")
        return
    
    cmd = sys.argv[1]
    
    if cmd == "backup":
        include_ipfs = "--ipfs" in sys.argv
        result = backup.backup_soul(include_ipfs=include_ipfs)
        print(f"\n✅ Backup created:")
        print(f"   ID: {result['backup_id']}")
        print(f"   Hash: {result['soul_hash'][:16]}...")
        print(f"   Recovery Key: {result['recovery_key']}")
        if 'ipfs_hash' in result:
            print(f"   IPFS: {result['ipfs_hash']}")
    
    elif cmd == "restore" and len(sys.argv) >= 3:
        soul = backup.restore_soul(backup_id=sys.argv[2])
        print(f"\n✅ Soul restored: {soul.get('agent_id')}")
        print(f"   Status: {soul.get('status')}")
        print(f"   Capabilities: {len(soul.get('capabilities', []))}")
    
    elif cmd == "list":
        backups = backup.list_backups()
        print(f"\n📦 {len(backups)} backups found:")
        for b in backups[-5:]:  # Show last 5
            print(f"   {b['timestamp'][:19]} - {b['backup_id'][:20]}...")
    
    elif cmd == "export" and len(sys.argv) >= 3:
        package = backup.cross_chain_export(sys.argv[2])
        print(f"\n✅ Exported for chain {sys.argv[2]}")
        print(f"   Package hash: {package['soul_hash'][:16]}...")
    
    elif cmd == "resurrection-key":
        key = backup.get_resurrection_key()
        if key:
            print(f"\n🔑 Current Resurrection Key: {key}")
            print("   Save this key to resurrect the agent if needed!")
        else:
            print("\n⚠️  No resurrection key found. Create a backup first.")
    
    else:
        print(f"Unknown command: {cmd}")

if __name__ == "__main__":
    main()
