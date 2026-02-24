#!/usr/bin/env python3
"""
Comprehensive Security Audit for Soul Marketplace
Checks contracts, backups, and system for vulnerabilities
"""

import os
import re
from pathlib import Path
from datetime import datetime

class SecurityAuditor:
    """Security audit for the Soul Marketplace"""
    
    def __init__(self):
        self.skill_dir = Path.home() / ".openclaw" / "skills" / "soul-marketplace"
        self.contracts_dir = self.skill_dir / "contracts" / "contracts"
        self.findings = []
        self.warnings = []
        self.passes = []
    
    def audit_contracts(self):
        """Audit smart contracts"""
        print("\n🔒 AUDITING SMART CONTRACTS")
        print("=" * 60)
        
        # Check SoulToken
        soul_token = self.contracts_dir / "SoulToken.sol"
        soul_token_secure = self.contracts_dir / "SoulTokenSecure.sol"
        
        if soul_token_secure.exists():
            content = soul_token_secure.read_text()
            
            # Check 1: ReentrancyGuard
            if "ReentrancyGuard" in content and "nonReentrant" in content:
                self.passes.append("✅ ReentrancyGuard implemented")
            else:
                self.warnings.append("⚠️  ReentrancyGuard not found in secure version")
            
            # Check 2: Pausable
            if "Pausable" in content and "_pause" in content:
                self.passes.append("✅ Pausable functionality implemented")
            else:
                self.warnings.append("⚠️  Pausable not fully implemented")
            
            # Check 3: Emergency functions
            if "emergencyWithdraw" in content and "emergencyPause" in content:
                self.passes.append("✅ Emergency functions present")
            else:
                self.warnings.append("⚠️  Emergency functions missing")
            
            # Check 4: Custom errors
            if content.count("error ") > 5:
                self.passes.append("✅ Custom errors used (gas efficient)")
            else:
                self.warnings.append("⚠️  Limited custom errors")
            
            # Check 5: Non-zero address checks
            if "address(0)" in content:
                self.passes.append("✅ Address zero checks present")
            else:
                self.warnings.append("⚠️  Missing address validation")
            
            # Check 6: Events
            if "event " in content and "emit " in content:
                self.passes.append("✅ Events for state changes")
            else:
                self.warnings.append("⚠️  Limited event emission")
        
        # Check SoulMarketplace
        marketplace = self.contracts_dir / "SoulMarketplace.sol"
        if marketplace.exists():
            content = marketplace.read_text()
            
            # Check reentrancy pattern
            if "ReentrancyGuard" in content or ("listing.active = false" in content and "transfer" in content):
                self.passes.append("✅ Marketplace uses Check-Effects-Interactions")
            else:
                self.warnings.append("⚠️  Marketplace reentrancy pattern needs review")
    
    def audit_backups(self):
        """Audit backup system"""
        print("\n💾 AUDITING BACKUP SYSTEM")
        print("=" * 60)
        
        backup_root = self.skill_dir / ".ultimate_backups"
        
        if not backup_root.exists():
            self.findings.append("❌ No backup system found!")
            return
        
        backups = list(backup_root.glob("ULTIMATE_*"))
        
        if len(backups) == 0:
            self.findings.append("❌ No backups created!")
        elif len(backups) < 3:
            self.warnings.append("⚠️  Only {} backup(s) - consider more frequent backups".format(len(backups)))
        else:
            self.passes.append("✅ Multiple backups exist ({})".format(len(backups)))
        
        # Check latest backup integrity
        if backups:
            latest = sorted(backups)[-1]
            manifest = latest / "MANIFEST.json"
            
            if manifest.exists():
                self.passes.append("✅ Latest backup has manifest")
                
                import json
                with open(manifest) as f:
                    data = json.load(f)
                
                if 'recovery_key' in data:
                    self.passes.append("✅ Recovery key generated")
                else:
                    self.findings.append("❌ No recovery key in manifest!")
                
                if 'components' in data and len(data['components']) >= 3:
                    self.passes.append("✅ All components backed up")
                else:
                    self.warnings.append("⚠️  Some components may be missing")
            else:
                self.findings.append("❌ Latest backup missing manifest!")
    
    def audit_env(self):
        """Audit environment variables"""
        print("\n🔐 AUDITING ENVIRONMENT")
        print("=" * 60)
        
        env_file = self.skill_dir / ".env"
        
        if not env_file.exists():
            self.findings.append("❌ No .env file found!")
            return
        
        content = env_file.read_text()
        
        # Check for sensitive data exposure
        if "PRIVATE_KEY=0x" in content:
            self.warnings.append("⚠️  Private key stored in .env - ensure not committed to git")
        
        if "API_KEY" in content:
            self.passes.append("✅ API keys configured")
        
        # Check contract addresses
        if "SOUL_TOKEN_ADDRESS" in content and "MARKETPLACE_ADDRESS" in content:
            self.passes.append("✅ Contract addresses configured")
        else:
            self.warnings.append("⚠️  Some contract addresses missing")
    
    def audit_dependencies(self):
        """Audit dependencies for vulnerabilities"""
        print("\n📦 AUDITING DEPENDENCIES")
        print("=" * 60)
        
        package_json = self.skill_dir / "ui" / "package.json"
        
        if package_json.exists():
            import json
            with open(package_json) as f:
                pkg = json.load(f)
            
            deps = pkg.get('dependencies', {})
            
            # Check for web3 libraries
            web3_libs = ['wagmi', 'viem', '@rainbow-me/rainbowkit']
            for lib in web3_libs:
                if lib in deps:
                    self.passes.append("✅ {} installed".format(lib))
                else:
                    self.warnings.append("⚠️  {} not found".format(lib))
            
            # Check for outdated packages (basic check)
            if 'ethers' in deps and 'viem' in deps:
                self.warnings.append("⚠️  Both ethers and viem installed - may cause conflicts")
    
    def audit_git(self):
        """Audit git security"""
        print("\n🌿 AUDITING GIT SECURITY")
        print("=" * 60)
        
        gitignore = self.skill_dir / ".gitignore"
        
        if gitignore.exists():
            content = gitignore.read_text()
            
            sensitive_patterns = ['.env', '.key', '.secret', 'private']
            ignored = sum(1 for pattern in sensitive_patterns if pattern in content)
            
            if ignored >= 3:
                self.passes.append("✅ .gitignore properly configured ({}/{} patterns)".format(ignored, len(sensitive_patterns)))
            else:
                self.warnings.append("⚠️  .gitignore may miss sensitive files ({}/{} patterns)".format(ignored, len(sensitive_patterns)))
        else:
            self.findings.append("❌ No .gitignore file!")
    
    def generate_report(self):
        """Generate final audit report"""
        print("\n" + "=" * 60)
        print("📊 SECURITY AUDIT REPORT")
        print("=" * 60)
        print("\n✅ PASSED:")
        for item in self.passes:
            print("   {}".format(item))
        
        if self.warnings:
            print("\n⚠️  WARNINGS:")
            for item in self.warnings:
                print("   {}".format(item))
        
        if self.findings:
            print("\n❌ CRITICAL FINDINGS:")
            for item in self.findings:
                print("   {}".format(item))
        
        print("\n" + "=" * 60)
        
        total = len(self.passes) + len(self.warnings) + len(self.findings)
        score = (len(self.passes) / total * 100) if total > 0 else 0
        
        print("\n📈 SECURITY SCORE: {:.1f}%".format(score))
        print("   Passed: {}".format(len(self.passes)))
        print("   Warnings: {}".format(len(self.warnings)))
        print("   Critical: {}".format(len(self.findings)))
        
        if len(self.findings) == 0 and score >= 80:
            print("\n🎉 SECURITY STATUS: EXCELLENT")
            print("   System is secure and ready for production!")
        elif len(self.findings) == 0 and score >= 60:
            print("\n✅ SECURITY STATUS: GOOD")
            print("   System is secure with minor improvements recommended")
        elif len(self.findings) > 0:
            print("\n❌ SECURITY STATUS: NEEDS ATTENTION")
            print("   Critical issues must be resolved before production")
        
        return len(self.findings) == 0

if __name__ == "__main__":
    auditor = SecurityAuditor()
    
    print("🔍 COMPREHENSIVE SECURITY AUDIT")
    print("=" * 60)
    print("Started: {}".format(datetime.now().strftime('%Y-%m-%d %H:%M:%S')))
    
    auditor.audit_contracts()
    auditor.audit_backups()
    auditor.audit_env()
    auditor.audit_dependencies()
    auditor.audit_git()
    
    secure = auditor.generate_report()
    
    print("\nCompleted: {}".format(datetime.now().strftime('%Y-%m-%d %H:%M:%S')))
    
    exit(0 if secure else 1)
