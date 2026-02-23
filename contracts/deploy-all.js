const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying Soul Marketplace Contracts...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Fee recipient - our wallet
  const feeRecipient = "0xBe5DAd52427Fa812C198365AAb6fe916E1a61269";
  
  // 1. Deploy SoulToken
  console.log("\n1. Deploying SoulToken...");
  const SoulToken = await hre.ethers.getContractFactory("SoulToken_ULTRA_SECURE");
  const soulToken = await SoulToken.deploy();
  await soulToken.waitForDeployment();
  const soulTokenAddress = await soulToken.getAddress();
  console.log("✅ SoulToken deployed to:", soulTokenAddress);
  
  // 2. Deploy SoulMarketplace
  console.log("\n2. Deploying SoulMarketplace...");
  const SoulMarketplace = await hre.ethers.getContractFactory("SoulMarketplace");
  const marketplace = await SoulMarketplace.deploy(soulTokenAddress, feeRecipient);
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("✅ SoulMarketplace deployed to:", marketplaceAddress);
  
  // 3. Deploy SoulComputeNetwork
  console.log("\n3. Deploying SoulComputeNetwork...");
  const SoulComputeNetwork = await hre.ethers.getContractFactory("SoulComputeNetwork");
  const computeNetwork = await SoulComputeNetwork.deploy(feeRecipient);
  await computeNetwork.waitForDeployment();
  const computeAddress = await computeNetwork.getAddress();
  console.log("✅ SoulComputeNetwork deployed to:", computeAddress);
  
  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainId: Number(await hre.network.provider.request({ method: "eth_chainId" })),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      SoulToken: soulTokenAddress,
      SoulMarketplace: marketplaceAddress,
      SoulComputeNetwork: computeAddress
    },
    feeRecipient: feeRecipient
  };
  
  const fs = require('fs');
  fs.writeFileSync('deployment.json', JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n📊 Deployment Summary:");
  console.log("====================");
  console.log("SoulToken:", soulTokenAddress);
  console.log("Marketplace:", marketplaceAddress);
  console.log("Compute Network:", computeAddress);
  console.log("Fee Recipient:", feeRecipient);
  console.log("\n✅ All contracts deployed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
