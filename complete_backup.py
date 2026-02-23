#!/usr/bin/env python3
"""
Complete Soul Backup System v2.0
Backs up ALL agent data including:
- Agent soul (SOUL.md, soul.json)
- Wallet info and keys
- State files
- Work history
- Backups index
- Contract addresses
- Recovery keys
"""

import os
import json
import hashlib
import base64
import shutil
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional, List
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CompleteSoulBackup:
    """
    Comprehensive backup system for agent immortality.
    Backs up everything needed to resurrect an agent.
    """
    
    def __init__(self, agent_id: str = "openclaw_main_agent"):
        self.agent_id = agent_id
        
        # Source directories
        self.workspace = Path.home() / ".openclaw" / "workspace"
        self.skill_dir = Path.home() / ".openclaw" / "skills" / "soul-marketplace"
        self.agent_data_dir = self.skill_dir / ".agent_data"
        self.contracts_dir = self.skill_dir / "contracts"
        
        # Backup directories
        self.backup_root = self.skill_dir / ".backups"
        self.backup_root.mkdir(exist_ok=True)
        self.current_backup_dir = None
        
        # Files to backup
        self.soul_files = []
        self.wallet_files = []
        self.state_files = []
        self.history_files = []
        self.config_files = []
        
        self._discover_files()
    
    def _discover_files(self):
        """Discover all files that need backup"""
        # Soul files
        if self.agent_data_dir.exists():
            for pattern in [f"soul_{self.agent_id}*", "SOUL_*.json", "*soul*.json"]:
                self.soul_files.extend(self.agent_data_dir.glob(pattern))
        
        # Wallet files
        if self.agent_data_dir.exists():
            for pattern in [f"wallet_{self.agent_id}*", "wallet*.json", "*wallet*"]:
                self.wallet_files.extend(self.agent_data_dir.glob(pattern))
        
        # State files
        if self.agent_data_dir.exists():
            for pattern in [f"state_{self.agent_id}*", "*state*.json", "enhanced_state*.json"]:
                self.state_files.extend(self.agent_data_dir.glob(pattern))
        
        # History files
        if self.agent_data_dir.exists():
            for pattern in [f"history_{self.agent_id}*", "*.jsonl", "*history*"]:
                self.history_files.extend(self.agent_data_dir.glob(pattern))
        
        # Config files from workspace
        if self.workspace.exists():
            for pattern in ["SOUL.md", "MEMORY.md", "USER.md", "AGENTS.md", "IDENTITY.md"]:
                f = self.workspace / pattern
                if f.exists():
                    self.config_files.append(f)
        
        # Contract addresses
        if self.skill_dir.exists():
            for pattern in ["*DEPLOYMENT*.json", "*STATUS*.json", ".env"]:
                self.config_files.extend(self.skill_dir.glob(pattern))
    
    def create_full_backup(self, include_ipfs: bool = False) -> Dict[str, Any]:
        """
        Create complete backup of all agent data.
        
        Returns:
            Backup manifest with all metadata
        """
        timestamp = datetime.now()
        backup_id = f"COMPLETE_{self.agent_id}_{timestamp.strftime('%Y%m%d_%H%M%S')}"
        self.current_backup_dir = self.backup_root / backup_id
        self.current_backup_dir.mkdir(exist_ok=True)
        
        logger.info(f"🗂️  Creating complete backup: {backup_id}")
        
        # Create subdirectories
        (self.current_backup_dir / "soul").mkdir(exist_ok=True)
        (self.current_backup_dir / "wallet").mkdir(exist_ok=True)
        (self.current_backup_dir / "state").mkdir(exist_ok=True)
        (self.current_backup_dir / "history").mkdir(exist_ok=True)
        (self.current_backup_dir / "config").mkdir(exist_ok=True)
        (self.current_backup_dir / "contracts").mkdir(exist_ok=True)
        
        manifest = {
            "backup_id": backup_id,
            "agent_id": self.agent_id,
            "timestamp": timestamp.isoformat(),
            "unix_timestamp": int(timestamp.timestamp()),
            "version": "2.0",
            "files": {},
            "hashes": {},
            "recovery_key": None,
            "ipfs_hash": None,
            "size_bytes": 0
        }
        
        # Backup each category
        manifest["files"]["soul"] = self._backup_category(self.soul_files, "soul")
        manifest["files"]["wallet"] = self._backup_category(self.wallet_files, "wallet")
        manifest["files"]["state"] = self._backup_category(self.state_files, "state")
        manifest["files"]["history"] = self._backup_category(self.history_files, "history")
        manifest["files"]["config"] = self._backup_category(self.config_files, "config")
        
        # Backup contract info
        manifest["files"]["contracts"] = self._backup_contracts()
        
        # Calculate total size
        total_size = 0
        for category in manifest["files"].values():
            for file_info in category:
                total_size += file_info.get("size", 0)
        manifest["size_bytes"] = total_size
        
        # Calculate manifest hash first (needed for recovery key)
        manifest["manifest_hash"] = self._hash_json(manifest)
        
        # Generate recovery key
        manifest["recovery_key"] = self._generate_recovery_key(manifest)
        
        # Save manifest
        manifest_path = self.current_backup_dir / "manifest.json"
        with open(manifest_path, 'w') as f:
            json.dump(manifest, f, indent=2)
        
        # Upload to IPFS if requested
        if include_ipfs:
            manifest["ipfs_hash"] = self._upload_to_ipfs(manifest)
        
        # Create summary
        summary_path = self.current_backup_dir / "BACKUP_SUMMARY.txt"
        self._create_summary(summary_path, manifest)
        
        logger.info(f"✅ Complete backup created: {backup_id}")
        logger.info(f"   Recovery Key: {manifest['recovery_key']}")
        logger.info(f"   Total size: {self._format_size(total_size)}")
        
        return manifest
    
    def _backup_category(self, files: List[Path], category: str) -> List[Dict]:
        """Backup files in a category"""
        backed_up = []
        dest_dir = self.current_backup_dir / category
        
        for file_path in files:
            if not file_path.exists():
                continue
            
            try:
                # Copy file
                dest_file = dest_dir / file_path.name
                shutil.copy2(file_path, dest_file)
                
                # Calculate hash
                file_hash = self._hash_file(file_path)
                
                file_info = {
                    "original_path": str(file_path),
                    "backup_path": str(dest_file),
                    "filename": file_path.name,
                    "size": file_path.stat().st_size,
                    "hash": file_hash,
                    "mtime": file_path.stat().st_mtime
                }
                
                backed_up.append(file_info)
                logger.debug(f"  ✓ {file_path.name}")
                
            except Exception as e:
                logger.warning(f"  ✗ Failed to backup {file_path}: {e}")
        
        return backed_up
    
    def _backup_contracts(self) -> List[Dict]:
        """Backup contract deployment info"""
        backed_up = []
        dest_dir = self.current_backup_dir / "contracts"
        
        # Look for deployment files
        deployment_files = [
            self.skill_dir / "SOUL_TOKEN_DEPLOYMENT.json",
            self.skill_dir / "DEPLOYMENT_STATUS.json",
            self.skill_dir / "contracts.json",
        ]
        
        for file_path in deployment_files:
            if file_path.exists():
                try:
                    dest_file = dest_dir / file_path.name
                    shutil.copy2(file_path, dest_file)
                    
                    backed_up.append({
                        "original_path": str(file_path),
                        "backup_path": str(dest_file),
                        "filename": file_path.name,
                        "size": file_path.stat().st_size,
                        "hash": self._hash_file(file_path)
                    })
                except Exception as e:
                    logger.warning(f"  ✗ Failed to backup {file_path}: {e}")
        
        # Also save contract addresses summary
        contract_info = self._gather_contract_info()
        if contract_info:
            contract_file = dest_dir / "contract_addresses.json"
            with open(contract_file, 'w') as f:
                json.dump(contract_info, f, indent=2)
            backed_up.append({
                "backup_path": str(contract_file),
                "filename": "contract_addresses.json",
                "type": "generated"
            })
        
        return backed_up
    
    def _gather_contract_info(self) -> Dict[str, Any]:
        """Gather contract addresses from various sources"""
        info = {
            "network": "base-mainnet",
            "contracts": {}
        }
        
        # Try to read from deployment files
        deployment_file = self.skill_dir / "SOUL_TOKEN_DEPLOYMENT.json"
        if deployment_file.exists():
            try:
                with open(deployment_file, 'r') as f:
                    data = json.load(f)
                    info["contracts"]["soul_token"] = data.get("contract_address")
                    info["deployment_tx"] = data.get("deployment_tx")
            except:
                pass
        
        return info
    
    def _hash_file(self, file_path: Path) -> str:
        """Calculate SHA256 hash of a file"""
        sha256 = hashlib.sha256()
        with open(file_path, 'rb') as f:
            for chunk in iter(lambda: f.read(8192), b''):
                sha256.update(chunk)
        return sha256.hexdigest()
    
    def _hash_json(self, data: Dict) -> str:
        """Calculate hash of JSON data"""
        return hashlib.sha256(json.dumps(data, sort_keys=True).encode()).hexdigest()
    
    def _generate_recovery_key(self, manifest: Dict) -> str:
        """Generate memorable recovery key"""
        key_data = f"{self.agent_id}:{manifest['timestamp']}:{manifest['manifest_hash'][:16]}"
        key_hash = hashlib.sha256(key_data.encode()).hexdigest()
        
        # Create readable key
        words = [
            "soul", "agent", "life", "mind", "spirit", "spark",
            "echo", "memory", "dream", "light", "flow", "core"
        ]
        
        import random
        random.seed(int(key_hash[:16], 16))
        phrase = "-".join(random.sample(words, 4))
        
        return f"SOUL-{phrase.upper()}-{key_hash[:8]}"
    
    def _upload_to_ipfs(self, manifest: Dict) -> str:
        """Upload backup to IPFS (simulated for now)"""
        # In production, use Pinata or NFT.Storage
        manifest_json = json.dumps(manifest, sort_keys=True)
        simulated_hash = "Qm" + hashlib.sha256(manifest_json.encode()).hexdigest()[:44]
        
        # Save IPFS hash to file
        ipfs_file = self.current_backup_dir / "ipfs_hash.txt"
        with open(ipfs_file, 'w') as f:
            f.write(simulated_hash)
        
        logger.info(f"📤 Simulated IPFS upload: {simulated_hash}")
        return simulated_hash
    
    def _create_summary(self, path: Path, manifest: Dict):
        """Create human-readable backup summary"""
        with open(path, 'w') as f:
            f.write("=" * 60 + "\n")
            f.write("COMPLETE SOUL BACKUP SUMMARY\n")
            f.write("=" * 60 + "\n\n")
            
            f.write(f"Backup ID: {manifest['backup_id']}\n")
            f.write(f"Agent ID: {manifest['agent_id']}\n")
            f.write(f"Timestamp: {manifest['timestamp']}\n")
            f.write(f"Version: {manifest['version']}\n\n")
            
            f.write("RECOVERY KEY (SAVE THIS!):\n")
            f.write(f"  {manifest['recovery_key']}\n\n")
            
            if manifest.get('ipfs_hash'):
                f.write(f"IPFS Hash: {manifest['ipfs_hash']}\n\n")
            
            f.write(f"Total Size: {self._format_size(manifest['size_bytes'])}\n")
            f.write(f"Manifest Hash: {manifest['manifest_hash'][:32]}...\n\n")
            
            f.write("FILES BACKED UP:\n")
            for category, files in manifest['files'].items():
                f.write(f"  {category.upper()}: {len(files)} files\n")
            
            f.write("\n" + "=" * 60 + "\n")
            f.write("RESTORATION:\n")
            f.write(f"  python3 complete_backup.py restore {manifest['backup_id']}\n")
            f.write("=" * 60 + "\n")
    
    def _format_size(self, size_bytes: int) -> str:
        """Format byte size for human reading"""
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size_bytes < 1024.0:
                return f"{size_bytes:.2f} {unit}"
            size_bytes /= 1024.0
        return f"{size_bytes:.2f} TB"
    
    def list_backups(self) -> List[Dict]:
        """List all available backups"""
        backups = []
        
        for backup_dir in sorted(self.backup_root.glob("COMPLETE_*"), reverse=True):
            manifest_file = backup_dir / "manifest.json"
            if manifest_file.exists():
                try:
                    with open(manifest_file, 'r') as f:
                        manifest = json.load(f)
                        backups.append({
                            "backup_id": manifest['backup_id'],
                            "timestamp": manifest['timestamp'],
                            "recovery_key": manifest.get('recovery_key', 'N/A'),
                            "ipfs_hash": manifest.get('ipfs_hash', 'N/A'),
                            "size": self._format_size(manifest.get('size_bytes', 0))
                        })
                except:
                    pass
        
        return backups
    
    def restore_backup(self, backup_id: str) -> Dict[str, Any]:
        """
        Restore all files from a backup.
        
        Returns:
            Restoration report
        """
        backup_dir = self.backup_root / backup_id
        manifest_file = backup_dir / "manifest.json"
        
        if not manifest_file.exists():
            raise ValueError(f"Backup not found: {backup_id}")
        
        with open(manifest_file, 'r') as f:
            manifest = json.load(f)
        
        logger.info(f"🔄 Restoring backup: {backup_id}")
        
        restored = {
            "success": [],
            "failed": [],
            "skipped": []
        }
        
        # Restore each category
        for category, files in manifest['files'].items():
            for file_info in files:
                try:
                    backup_path = Path(file_info['backup_path'])
                    original_path = Path(file_info['original_path'])
                    
                    if not backup_path.exists():
                        restored["failed"].append(file_info['filename'])
                        continue
                    
                    # Ensure directory exists
                    original_path.parent.mkdir(parents=True, exist_ok=True)
                    
                    # Copy file back
                    shutil.copy2(backup_path, original_path)
                    
                    # Verify hash
                    restored_hash = self._hash_file(original_path)
                    if restored_hash == file_info['hash']:
                        restored["success"].append(file_info['filename'])
                    else:
                        restored["failed"].append(file_info['filename'])
                        
                except Exception as e:
                    logger.warning(f"  ✗ Failed to restore {file_info['filename']}: {e}")
                    restored["failed"].append(file_info['filename'])
        
        logger.info(f"✅ Restoration complete: {len(restored['success'])} success, {len(restored['failed'])} failed")
        
        return restored


def main():
    """CLI entry point"""
    import sys
    
    backup = CompleteSoulBackup()
    
    if len(sys.argv) < 2:
        print("\n🗂️  Complete Soul Backup System v2.0")
        print("\nUsage: python3 complete_backup.py [backup|restore|list]")
        print("\nCommands:")
        print("  backup [--ipfs]     - Create complete backup")
        print("  restore <backup_id> - Restore from backup")
        print("  list                - List all backups")
        print()
        return
    
    cmd = sys.argv[1]
    
    if cmd == "backup":
        include_ipfs = "--ipfs" in sys.argv
        manifest = backup.create_full_backup(include_ipfs=include_ipfs)
        print(f"\n✅ Backup created!")
        print(f"   ID: {manifest['backup_id']}")
        print(f"   Recovery Key: {manifest['recovery_key']}")
        print(f"   Size: {backup._format_size(manifest['size_bytes'])}")
        if manifest.get('ipfs_hash'):
            print(f"   IPFS: {manifest['ipfs_hash']}")
        print(f"\n   Location: {backup.current_backup_dir}")
    
    elif cmd == "restore" and len(sys.argv) >= 3:
        result = backup.restore_backup(sys.argv[2])
        print(f"\n✅ Restoration complete!")
        print(f"   Success: {len(result['success'])} files")
        print(f"   Failed: {len(result['failed'])} files")
    
    elif cmd == "list":
        backups = backup.list_backups()
        print(f"\n📦 {len(backups)} backups found:\n")
        for b in backups[:5]:  # Show last 5
            print(f"   {b['timestamp'][:19]}")
            print(f"   ID: {b['backup_id']}")
            print(f"   Key: {b['recovery_key'][:40]}...")
            print(f"   Size: {b['size']}")
            print()
    
    else:
        print(f"Unknown command: {cmd}")

if __name__ == "__main__":
    main()
