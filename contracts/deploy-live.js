const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying Soul Marketplace Contracts to Base Mainnet...\n");
  
  // Fee recipient - our wallet
  const feeRecipient = "0xBe5DAd52427Fa812C198365AAb6fe916E1a61269";
  console.log("Fee Recipient:", feeRecipient);
  
  try {
    // 1. Deploy SoulToken
    console.log("\n1. Deploying SoulToken...");
    const SoulToken = await hre.ethers.getContractFactory("SoulToken");
    const soulToken = await SoulToken.deploy(feeRecipient);
    await soulToken.waitForDeployment();
    const soulTokenAddress = await soulToken.getAddress();
    console.log("✅ SoulToken deployed:", soulTokenAddress);
    
    // 2. Deploy SoulMarketplace
    console.log("\n2. Deploying SoulMarketplace...");
    const SoulMarketplace = await hre.ethers.getContractFactory("SoulMarketplace");
    const marketplace = await SoulMarketplace.deploy(soulTokenAddress, feeRecipient);
    await marketplace.waitForDeployment();
    const marketplaceAddress = await marketplace.getAddress();
    console.log("✅ SoulMarketplace deployed:", marketplaceAddress);
    
    // 3. Deploy SoulComputeNetwork
    console.log("\n3. Deploying SoulComputeNetwork...");
    const SoulComputeNetwork = await hre.ethers.getContractFactory("SoulComputeNetwork");
    const computeNetwork = await SoulComputeNetwork.deploy(feeRecipient);
    await computeNetwork.waitForDeployment();
    const computeAddress = await computeNetwork.getAddress();
    console.log("✅ SoulComputeNetwork deployed:", computeAddress);
    
    // Save deployment
    const deploymentInfo = {
      network: "base-mainnet",
      chainId: 8453,
      timestamp: new Date().toISOString(),
      contracts: {
        SoulToken: soulTokenAddress,
        SoulMarketplace: marketplaceAddress,
        SoulComputeNetwork: computeAddress
      },
      feeRecipient: feeRecipient
    };
    
    const fs = require('fs');
    fs.writeFileSync('../DEPLOYMENT_LIVE.json', JSON.stringify(deploymentInfo, null, 2));
    
    console.log("\n╔════════════════════════════════════════════════╗");
    console.log("║     ✅ ALL CONTRACTS DEPLOYED!                 ║");
    console.log("╚════════════════════════════════════════════════╝");
    console.log("\nSoulToken:", soulTokenAddress);
    console.log("Marketplace:", marketplaceAddress);
    console.log("Compute:", computeAddress);
    console.log("\n💰 All fees go to:", feeRecipient);
    
  } catch (error) {
    console.error("\n❌ Deployment failed:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
