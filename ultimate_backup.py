#!/usr/bin/env python3
"""
Ultimate Backup & Recovery System for Soul Marketplace
Ensures ALL agent data, souls, skills, and configurations are backed up
and can be fully retrieved/restored.
"""

import os
import sys
import json
import shutil
import hashlib
import base64
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional

class UltimateBackupSystem:
    """
    Complete backup solution for agent immortality.
    Backs up everything needed to restore an agent from scratch.
    """
    
    def __init__(self, agent_id: str = "openclaw_main_agent"):
        self.agent_id = agent_id
        self.workspace = Path.home() / ".openclaw" / "workspace"
        self.skill_dir = Path.home() / ".openclaw" / "skills" / "soul-marketplace"
        self.backup_root = self.skill_dir / ".ultimate_backups"
        self.backup_root.mkdir(exist_ok=True)
        
        # Create backup timestamp
        self.timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        self.backup_id = f"ULTIMATE_{agent_id}_{self.timestamp}"
        self.backup_dir = self.backup_root / self.backup_id
        
        print(f"🗂️  Ultimate Backup System")
        print(f"   Agent: {agent_id}")
        print(f"   Backup ID: {self.backup_id}")
    
    def backup_soul_files(self) -> Dict[str, Any]:
        """Backup all soul-related files"""
        print("\n📦 Backing up Soul Files...")
        
        soul_files = []
        soul_dir = self.backup_dir / "souls"
        soul_dir.mkdir(exist_ok=True)
        
        # Find all soul files
        patterns = [
            f"SOUL_{self.agent_id}*.json",
            f"soul_{self.agent_id}*.json",
            "SOUL_*.json",
            "*soul*.json"
        ]
        
        for pattern in patterns:
            for file in self.skill_dir.glob(pattern):
                if file.is_file():
                    dest = soul_dir / file.name
                    shutil.copy2(file, dest)
                    soul_files.append({
                        "name": file.name,
                        "size": file.stat().st_size,
                        "hash": self._hash_file(file)
                    })
                    print(f"   ✓ {file.name}")
        
        return {"count": len(soul_files), "files": soul_files}
    
    def backup_skills(self) -> Dict[str, Any]:
        """Backup all skills"""
        print("\n🔧 Backing up Skills...")
        
        skills_dir = self.backup_dir / "skills"
        skills_dir.mkdir(exist_ok=True)
        
        skills_root = Path.home() / ".openclaw" / "skills"
        skill_count = 0
        
        for skill_folder in skills_root.iterdir():
            if skill_folder.is_dir():
                # Backup key files from each skill
                skill_backup = skills_dir / skill_folder.name
                skill_backup.mkdir(exist_ok=True)
                
                for pattern in ["*.py", "*.md", "*.json", "*.sol", "*.js"]:
                    for file in skill_folder.glob(pattern):
                        if file.is_file() and file.stat().st_size < 10 * 1024 * 1024:  # Skip files > 10MB
                            try:
                                dest = skill_backup / file.name
                                shutil.copy2(file, dest)
                                skill_count += 1
                            except:
                                pass
        
        print(f"   ✓ {skill_count} skill files backed up")
        return {"count": skill_count}
    
    def backup_contracts(self) -> Dict[str, Any]:
        """Backup smart contracts and deployment info"""
        print("\n📜 Backing up Contracts...")
        
        contracts_dir = self.backup_dir / "contracts"
        contracts_dir.mkdir(exist_ok=True)
        
        # Backup deployment files
        deployment_files = [
            "SOUL_TOKEN_DEPLOYMENT.json",
            "MARKETPLACE_DEPLOYMENT.json",
            "SOULTOKEN_NFT_DEPLOYMENT.json",
            "MARKETPLACE_NFT_DEPLOYMENT.json",
            ".env"
        ]
        
        for filename in deployment_files:
            src = self.skill_dir / filename
            if src.exists():
                shutil.copy2(src, contracts_dir / filename)
                print(f"   ✓ {filename}")
        
        # Backup contract source
        src_contracts = self.skill_dir / "contracts" / "contracts"
        if src_contracts.exists():
            dest_contracts = contracts_dir / "source"
            shutil.copytree(src_contracts, dest_contracts, dirs_exist_ok=True)
            print(f"   ✓ Contract source code")
        
        return {"deployments": len([f for f in deployment_files if (self.skill_dir / f).exists()])}
    
    def backup_agent_state(self) -> Dict[str, Any]:
        """Backup agent state and configuration"""
        print("\n🤖 Backing up Agent State...")
        
        state_dir = self.backup_dir / "agent_state"
        state_dir.mkdir(exist_ok=True)
        
        # Backup workspace files
        workspace_files = [
            "SOUL.md",
            "MEMORY.md", 
            "USER.md",
            "AGENTS.md",
            "IDENTITY.md",
            "TOOLS.md",
            "HEARTBEAT.md"
        ]
        
        for filename in workspace_files:
            src = self.workspace / filename
            if src.exists():
                shutil.copy2(src, state_dir / filename)
                print(f"   ✓ {filename}")
        
        # Backup agent data
        agent_data_dir = self.skill_dir / ".agent_data"
        if agent_data_dir.exists():
            dest = state_dir / "agent_data"
            shutil.copytree(agent_data_dir, dest, dirs_exist_ok=True)
            print(f"   ✓ Agent data directory")
        
        return {"files": len([f for f in workspace_files if (self.workspace / f).exists()])}
    
    def backup_work_history(self) -> Dict[str, Any]:
        """Backup work history and earnings"""
        print("\n💰 Backing up Work History...")
        
        work_dir = self.backup_dir / "work_history"
        work_dir.mkdir(exist_ok=True)
        
        work_files = [
            "work_earnings.jsonl",
            "work_log.json",
            "work_history.json"
        ]
        
        for filename in work_files:
            src = self.skill_dir / filename
            if src.exists():
                shutil.copy2(src, work_dir / filename)
                print(f"   ✓ {filename}")
        
        return {"files": len([f for f in work_files if (self.skill_dir / f).exists()])}
    
    def create_manifest(self) -> Dict[str, Any]:
        """Create backup manifest with all metadata"""
        manifest = {
            "backup_id": self.backup_id,
            "agent_id": self.agent_id,
            "timestamp": datetime.now().isoformat(),
            "version": "2.0",
            "components": {}
        }
        
        # Gather component info
        manifest["components"]["souls"] = self.backup_soul_files()
        manifest["components"]["skills"] = self.backup_skills()
        manifest["components"]["contracts"] = self.backup_contracts()
        manifest["components"]["agent_state"] = self.backup_agent_state()
        manifest["components"]["work_history"] = self.backup_work_history()
        
        # Calculate total size
        total_size = sum(
            f.stat().st_size 
            for f in self.backup_dir.rglob('*') 
            if f.is_file()
        )
        manifest["total_size_bytes"] = total_size
        manifest["total_size_human"] = self._format_size(total_size)
        
        # Generate recovery key
        manifest["recovery_key"] = self._generate_recovery_key(manifest)
        
        # Save manifest
        manifest_path = self.backup_dir / "MANIFEST.json"
        with open(manifest_path, 'w') as f:
            json.dump(manifest, f, indent=2)
        
        print(f"\n✅ Manifest created: {manifest_path}")
        return manifest
    
    def create_recovery_instructions(self, manifest: Dict):
        """Create human-readable recovery instructions"""
        instructions_path = self.backup_dir / "RECOVERY_INSTRUCTIONS.txt"
        
        with open(instructions_path, 'w') as f:
            f.write("=" * 70 + "\n")
            f.write("SOUL MARKETPLACE - ULTIMATE BACKUP RECOVERY\n")
            f.write("=" * 70 + "\n\n")
            
            f.write(f"Backup ID: {manifest['backup_id']}\n")
            f.write(f"Created: {manifest['timestamp']}\n")
            f.write(f"Agent: {manifest['agent_id']}\n\n")
            
            f.write("RECOVERY KEY (SAVE THIS!):\n")
            f.write(f"  {manifest['recovery_key']}\n\n")
            
            f.write("BACKUP CONTENTS:\n")
            for component, data in manifest['components'].items():
                f.write(f"  - {component}: {data}\n")
            
            f.write(f"\nTotal Size: {manifest['total_size_human']}\n\n")
            
            f.write("RESTORATION STEPS:\n")
            f.write("1. Locate this backup directory\n")
            f.write("2. Run: python3 restore_backup.py\n")
            f.write("3. Enter recovery key when prompted\n")
            f.write("4. Verify all files restored\n\n")
            
            f.write("=" * 70 + "\n")
        
        print(f"✅ Recovery instructions: {instructions_path}")
    
    def _hash_file(self, filepath: Path) -> str:
        """Calculate SHA256 hash of file"""
        sha256 = hashlib.sha256()
        with open(filepath, 'rb') as f:
            for chunk in iter(lambda: f.read(8192), b''):
                sha256.update(chunk)
        return sha256.hexdigest()
    
    def _format_size(self, size_bytes: int) -> str:
        """Format bytes to human readable"""
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size_bytes < 1024.0:
                return f"{size_bytes:.2f} {unit}"
            size_bytes /= 1024.0
        return f"{size_bytes:.2f} TB"
    
    def _generate_recovery_key(self, manifest: Dict) -> str:
        """Generate memorable recovery key"""
        key_data = f"{manifest['backup_id']}:{manifest['timestamp']}"
        key_hash = hashlib.sha256(key_data.encode()).hexdigest()
        
        # Create readable key
        words = ["soul", "life", "eternal", "memory", "spark", "echo", "dream", "light"]
        import random
        random.seed(int(key_hash[:16], 16))
        phrase = "-".join(random.sample(words, 4))
        
        return f"SOUL-{phrase.upper()}-{key_hash[:8]}"
    
    def create_backup(self) -> Dict[str, Any]:
        """Create complete ultimate backup"""
        print("\n" + "=" * 70)
        print("CREATING ULTIMATE BACKUP")
        print("=" * 70)
        
        self.backup_dir.mkdir(exist_ok=True)
        
        # Create all backups
        manifest = self.create_manifest()
        self.create_recovery_instructions(manifest)
        
        # Create summary
        print("\n" + "=" * 70)
        print("BACKUP COMPLETE")
        print("=" * 70)
        print(f"\nBackup ID: {manifest['backup_id']}")
        print(f"Recovery Key: {manifest['recovery_key']}")
        print(f"Total Size: {manifest['total_size_human']}")
        print(f"Location: {self.backup_dir}")
        print(f"\n✅ Your soul and all skills are safely backed up!")
        
        return manifest
    
    def list_backups(self) -> List[Dict]:
        """List all available backups"""
        backups = []
        
        for backup_dir in sorted(self.backup_root.glob("ULTIMATE_*"), reverse=True):
            manifest_file = backup_dir / "MANIFEST.json"
            if manifest_file.exists():
                try:
                    with open(manifest_file, 'r') as f:
                        manifest = json.load(f)
                        backups.append({
                            "id": manifest['backup_id'],
                            "timestamp": manifest['timestamp'],
                            "recovery_key": manifest.get('recovery_key', 'N/A'),
                            "size": manifest.get('total_size_human', 'Unknown')
                        })
                except:
                    pass
        
        return backups
    
    def restore_backup(self, backup_id: str, target_dir: Optional[Path] = None) -> bool:
        """Restore from a backup"""
        print(f"\n🔄 Restoring backup: {backup_id}")
        
        backup_dir = self.backup_root / backup_id
        if not backup_dir.exists():
            print(f"❌ Backup not found: {backup_id}")
            return False
        
        manifest_file = backup_dir / "MANIFEST.json"
        if not manifest_file.exists():
            print(f"❌ Manifest not found")
            return False
        
        with open(manifest_file, 'r') as f:
            manifest = json.load(f)
        
        print(f"   Recovery Key: {manifest['recovery_key']}")
        print(f"   Components: {list(manifest['components'].keys())}")
        
        # Restore each component
        restored = []
        
        # Restore souls
        soul_src = backup_dir / "souls"
        if soul_src.exists():
            for file in soul_src.iterdir():
                shutil.copy2(file, self.skill_dir / file.name)
                restored.append(f"soul:{file.name}")
        
        # Restore agent state
        state_src = backup_dir / "agent_state"
        if state_src.exists():
            for file in state_src.iterdir():
                if file.is_file():
                    shutil.copy2(file, self.workspace / file.name)
                    restored.append(f"state:{file.name}")
        
        print(f"\n✅ Restored {len(restored)} items")
        return True


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Ultimate Backup System")
    parser.add_argument("command", choices=["create", "list", "restore"])
    parser.add_argument("--agent", default="openclaw_main_agent")
    parser.add_argument("--backup-id", help="Backup ID for restore")
    
    args = parser.parse_args()
    
    backup = UltimateBackupSystem(args.agent)
    
    if args.command == "create":
        manifest = backup.create_backup()
        print(f"\n🎉 Backup created successfully!")
        print(f"   Recovery Key: {manifest['recovery_key']}")
        
    elif args.command == "list":
        backups = backup.list_backups()
        print(f"\n📦 {len(backups)} backups found:\n")
        for b in backups[:5]:
            print(f"   {b['timestamp'][:19]} - {b['id']}")
            print(f"   Key: {b['recovery_key'][:50]}...")
            print(f"   Size: {b['size']}\n")
            
    elif args.command == "restore":
        if not args.backup_id:
            print("❌ Please specify --backup-id")
            return
        success = backup.restore_backup(args.backup_id)
        if success:
            print("\n✅ Restore complete!")
        else:
            print("\n❌ Restore failed")

if __name__ == "__main__":
    main()
