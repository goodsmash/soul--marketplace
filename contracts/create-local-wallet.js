const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Create a new random wallet
const wallet = ethers.Wallet.createRandom();

console.log('🎉 LOCAL WALLET CREATED (Temporary until CDP secret is configured)');
console.log('═══════════════════════════════════════════════════════════════');
console.log('Address:', wallet.address);
console.log('Private Key:', wallet.privateKey);
console.log('Mnemonic:', wallet.mnemonic.phrase);
console.log('═══════════════════════════════════════════════════════════════');
console.log('\n⚠️  SAVE THE MNEMONIC SECURELY!');
console.log('This is your backup to recover the wallet.\n');

// Save wallet data
const agentDataDir = path.join(__dirname, '..', '.agent_data');
if (!fs.existsSync(agentDataDir)) {
  fs.mkdirSync(agentDataDir, { recursive: true });
}

const walletData = {
  type: 'local_wallet_temp',
  address: wallet.address,
  public_key: wallet.publicKey,
  created_at: new Date().toISOString(),
  network: 'base-sepolia'
};

// Save without private key for security
fs.writeFileSync(
  path.join(agentDataDir, 'wallet_openclaw_main_agent.json'),
  JSON.stringify(walletData, null, 2)
);

// Save mnemonic separately (WARNING: secure this!)
const mnemonicData = {
  mnemonic: wallet.mnemonic.phrase,
  path: wallet.mnemonic.path,
  locale: wallet.mnemonic.locale,
  warning: 'KEEP THIS SECURE - NEVER SHARE'
};

fs.writeFileSync(
  path.join(agentDataDir, 'wallet_mnemonic SECURE.json'),
  JSON.stringify(mnemonicData, null, 2)
);

console.log('✅ Wallet info saved to:');
console.log('  ', path.join(agentDataDir, 'wallet_openclaw_main_agent.json'));
console.log('  ', path.join(agentDataDir, 'wallet_mnemonic SECURE.json'));
console.log('\n📋 NEXT STEPS:');
console.log('1. Fund this address with Base Sepolia ETH:');
console.log('   https://www.coinbase.com/faucets/base-sepolia-faucet');
console.log('2. Once CDP project secret is configured, we can migrate');
console.log('3. Or continue using this wallet with Bankr integration');
