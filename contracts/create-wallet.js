const { CdpClient } = require('@coinbase/cdp-sdk');
require('dotenv').config({ path: '../.env' });

async function main() {
  console.log('Creating CDP wallet...');
  
  try {
    const client = new CdpClient({
      apiKeyId: process.env.CDP_API_KEY_ID,
      apiKeySecret: process.env.CDP_API_KEY_SECRET,
    });

    // Try to create an account
    console.log('Attempting to create account...');
    const account = await client.evm.createAccount({
      name: 'openclaw-main-agent'
    });
    
    console.log('✅ Wallet created successfully!');
    console.log('Address:', account.address);
    console.log('Account ID:', account.id);
    
    // Save to file
    const fs = require('fs');
    const walletData = {
      address: account.address,
      id: account.id,
      created_at: new Date().toISOString()
    };
    
    fs.writeFileSync('../.agent_data/wallet_openclaw_main_agent.json', JSON.stringify(walletData, null, 2));
    console.log('Wallet saved to .agent_data/wallet_openclaw_main_agent.json');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('Project has no secret')) {
      console.log('\n⚠️  Project needs a secret registered in CDP portal.');
      console.log('Go to https://portal.cdp.coinbase.com/ → Settings → Secrets');
    }
  }
}

main();
