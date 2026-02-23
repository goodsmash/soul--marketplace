// Deploy SoulMarketplace to Base Mainnet
const hre = require("hardhat");
require('dotenv').config();

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("Deploying SoulMarketplace with account:", deployer.address);
  console.log("Network:", hre.network.name);
  
  // Get the SoulToken address
  const soulTokenAddress = process.env.SOUL_TOKEN_ADDRESS;
  if (!soulTokenAddress) {
    throw new Error("SOUL_TOKEN_ADDRESS not set in .env");
  }
  
  console.log("SoulToken address:", soulTokenAddress);
  
  // Fee recipient (deployer for now)
  const feeRecipient = deployer.address;
  
  // Deploy SoulMarketplace
  const SoulMarketplace = await hre.ethers.getContractFactory("SoulMarketplace");
  const marketplace = await SoulMarketplace.deploy(soulTokenAddress, feeRecipient);
  
  await marketplace.waitForDeployment();
  
  const address = await marketplace.getAddress();
  console.log("✅ SoulMarketplace deployed to:", address);
  
  // Save deployment info
  const deploymentInfo = {
    contract_name: "SoulMarketplace",
    address: address,
    soul_token: soulTokenAddress,
    fee_recipient: feeRecipient,
    network: hre.network.name,
    deployed_at: new Date().toISOString(),
    deployed_by: deployer.address,
    tx_hash: marketplace.deploymentTransaction().hash
  };
  
  const fs = require('fs');
  fs.writeFileSync(
    '../MARKETPLACE_DEPLOYMENT.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\nDeployment saved to MARKETPLACE_DEPLOYMENT.json");
  console.log("\nUpdate your .env with:");
  console.log(`MARKETPLACE_ADDRESS=${address}`);
  
  // Verify on Basescan (if API key available)
  console.log("\nTo verify on Basescan:");
  console.log(`npx hardhat verify --network baseMainnet ${address} ${soulTokenAddress} ${feeRecipient}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
