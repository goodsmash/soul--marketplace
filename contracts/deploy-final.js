const hre = require("hardhat");

async function main() {
  console.log("🚀 DEPLOYING SOUL MARKETPLACE TO BASE MAINNET\n");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "ETH\n");
  
  const feeRecipient = "0xBe5DAd52427Fa812C198365AAb6fe916E1a61269";
  
  try {
    // Deploy SoulToken
    console.log("1. Deploying SoulToken...");
    const SoulToken = await hre.ethers.getContractFactory("SoulToken");
    const soulToken = await SoulToken.deploy(feeRecipient);
    await soulToken.waitForDeployment();
    const soulTokenAddress = await soulToken.getAddress();
    console.log("✅ SoulToken:", soulTokenAddress);
    
    // Deploy SoulMarketplace
    console.log("\n2. Deploying SoulMarketplace...");
    const SoulMarketplace = await hre.ethers.getContractFactory("SoulMarketplace");
    const marketplace = await SoulMarketplace.deploy(soulTokenAddress, feeRecipient);
    await marketplace.waitForDeployment();
    const marketplaceAddress = await marketplace.getAddress();
    console.log("✅ SoulMarketplace:", marketplaceAddress);
    
    // Deploy SoulComputeNetwork
    console.log("\n3. Deploying SoulComputeNetwork...");
    const SoulComputeNetwork = await hre.ethers.getContractFactory("SoulComputeNetwork");
    const computeNetwork = await SoulComputeNetwork.deploy(feeRecipient);
    await computeNetwork.waitForDeployment();
    const computeAddress = await computeNetwork.getAddress();
    console.log("✅ SoulComputeNetwork:", computeAddress);
    
    // Save deployment
    const deployment = {
      network: "base-mainnet",
      chainId: 8453,
      timestamp: new Date().toISOString(),
      deployer: deployer.address,
      contracts: {
        SoulToken: soulTokenAddress,
        SoulMarketplace: marketplaceAddress,
        SoulComputeNetwork: computeAddress
      },
      feeRecipient: feeRecipient
    };
    
    const fs = require('fs');
    fs.writeFileSync('../DEPLOYMENT_LIVE.json', JSON.stringify(deployment, null, 2));
    
    console.log("\n╔════════════════════════════════════════════════╗");
    console.log("║     ✅ DEPLOYMENT SUCCESSFUL!                  ║");
    console.log("╚════════════════════════════════════════════════╝");
    console.log("\n📋 Contract Addresses:");
    console.log("   SoulToken:", soulTokenAddress);
    console.log("   Marketplace:", marketplaceAddress);
    console.log("   Compute:", computeAddress);
    console.log("\n💰 All fees go to:", feeRecipient);
    console.log("\n📄 Saved to: DEPLOYMENT_LIVE.json");
    
  } catch (error) {
    console.error("\n❌ Deployment failed:", error.message);
    console.error(error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
