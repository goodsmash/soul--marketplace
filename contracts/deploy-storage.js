// Deploy SoulStorage
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("Deploying SoulStorage with account:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");
  
  const SoulStorage = await hre.ethers.getContractFactory("SoulStorage");
  const storage = await SoulStorage.deploy();
  
  await storage.waitForDeployment();
  
  const address = await storage.getAddress();
  console.log("✅ SoulStorage deployed to:", address);
  console.log("This contract stores agent souls permanently on Base!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
