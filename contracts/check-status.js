const { CdpClient } = require('@coinbase/cdp-sdk');
require('dotenv').config({ path: '../.env' });

async function main() {
  console.log('Checking CDP configuration...\n');
  
  const client = new CdpClient({
    apiKeyId: process.env.CDP_API_KEY_ID,
    apiKeySecret: process.env.CDP_API_KEY_SECRET,
  });

  // List existing accounts
  try {
    console.log('Fetching existing accounts...');
    const accounts = await client.evm.listAccounts();
    console.log('Accounts found:', accounts.accounts ? accounts.accounts.length : 0);
    
    if (accounts.accounts && accounts.accounts.length > 0) {
      accounts.accounts.forEach((acc, i) => {
        console.log(`  ${i + 1}. ${acc.address} (${acc.id})`);
      });
    }
  } catch (error) {
    console.error('Error listing accounts:', error.message);
  }

  // Check if we can get project info
  console.log('\n--- API Key Info ---');
  console.log('Key ID:', process.env.CDP_API_KEY_ID);
  console.log('Key ID Prefix:', process.env.CDP_API_KEY_ID?.substring(0, 8) + '...');
  
  console.log('\n⚠️  To create wallets, you need to:');
  console.log('1. Go to https://portal.cdp.coinbase.com/');
  console.log('2. Select your project');
  console.log('3. Go to Settings');
  console.log('4. Find "Secrets" or "Project Secrets"');
  console.log('5. Click "Register Secret"');
  console.log('\nThe secret is different from your API key.');
  console.log('It\'s a project-level configuration required for wallet creation.');
}

main();
