// Deploy SoulTokenSecure
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("Deploying SoulTokenSecure with account:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");
  
  const SoulTokenSecure = await hre.ethers.getContractFactory("contracts/SoulTokenSecure.sol:SoulToken");
  const soulToken = await SoulTokenSecure.deploy(deployer.address);
  
  await soulToken.waitForDeployment();
  
  const address = await soulToken.getAddress();
  console.log("✅ SoulTokenSecure deployed to:", address);
  console.log("Features:");
  console.log("  - ReentrancyGuard");
  console.log("  - Pausable");
  console.log("  - Emergency functions");
  console.log("  - 0.00001 ETH mint fee");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
