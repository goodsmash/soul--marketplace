const hre = require("hardhat");

/**
 * Deploy Soul Marketplace to Base Sepolia
 * Usage: npx hardhat run scripts/deploy.js --network baseSepolia
 */

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy SoulToken
  console.log("\n📄 Deploying SoulToken...");
  const SoulToken = await hre.ethers.getContractFactory("SoulToken");
  const soulToken = await SoulToken.deploy();
  await soulToken.waitForDeployment();
  const soulTokenAddress = await soulToken.getAddress();
  console.log("✅ SoulToken deployed to:", soulTokenAddress);

  // Deploy SoulMarketplace
  console.log("\n🏪 Deploying SoulMarketplace...");
  const SoulMarketplace = await hre.ethers.getContractFactory("SoulMarketplace");
  const marketplace = await SoulMarketplace.deploy(soulTokenAddress);
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("✅ SoulMarketplace deployed to:", marketplaceAddress);

  // Deploy SoulStaking
  console.log("\n🥩 Deploying SoulStaking...");
  const SoulStaking = await hre.ethers.getContractFactory("SoulStaking");
  const staking = await SoulStaking.deploy(soulTokenAddress);
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log("✅ SoulStaking deployed to:", stakingAddress);

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainId: Number(await hre.network.provider.request({ method: "eth_chainId" })),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      SoulToken: soulTokenAddress,
      SoulMarketplace: marketplaceAddress,
      SoulStaking: stakingAddress
    }
  };

  const fs = require('fs');
  const path = require('path');
  
  const deploymentPath = path.join(__dirname, '..', 'deployment.json');
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n📝 Deployment info saved to deployment.json");
  console.log("\n📊 Contract Addresses:");
  console.log("  SoulToken:", soulTokenAddress);
  console.log("  Marketplace:", marketplaceAddress);
  console.log("  Staking:", stakingAddress);
  
  // Verify on BaseScan (if API key configured)
  console.log("\n🔍 To verify on BaseScan:");
  console.log(`  npx hardhat verify --network baseSepolia ${soulTokenAddress}`);
  console.log(`  npx hardhat verify --network baseSepolia ${marketplaceAddress} ${soulTokenAddress}`);
  console.log(`  npx hardhat verify --network baseSepolia ${stakingAddress} ${soulTokenAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
