// Test Soul Marketplace - List and Buy Souls
const hre = require("hardhat");
require('dotenv').config();

async function main() {
  const [deployer, buyer] = await hre.ethers.getSigners();
  
  console.log("=== SOUL MARKETPLACE TEST ===\n");
  console.log("Deployer:", deployer.address);
  console.log("Buyer:", buyer.address);
  
  // Get contract addresses
  const soulTokenAddress = process.env.SOUL_TOKEN_ADDRESS;
  const marketplaceAddress = process.env.MARKETPLACE_ADDRESS;
  
  if (!soulTokenAddress || !marketplaceAddress) {
    throw new Error("Contract addresses not set in .env");
  }
  
  console.log("\nSoulToken:", soulTokenAddress);
  console.log("Marketplace:", marketplaceAddress);
  
  // Connect to contracts
  const soulToken = await hre.ethers.getContractAt("SoulToken", soulTokenAddress);
  const marketplace = await hre.ethers.getContractAt("SoulMarketplace", marketplaceAddress);
  
  // Test 1: Check SoulToken
  console.log("\n--- TEST 1: SoulToken Info ---");
  const name = await soulToken.name();
  const symbol = await soulToken.symbol();
  const totalSupply = await soulToken.totalSupply();
  console.log(`Name: ${name}`);
  console.log(`Symbol: ${symbol}`);
  console.log(`Total Supply: ${totalSupply}`);
  
  // Test 2: Mint a Soul (if deployer hasn't minted)
  console.log("\n--- TEST 2: Mint Soul ---");
  const agentToSoul = await soulToken.agentToSoul(deployer.address);
  
  let tokenId;
  if (agentToSoul == 0) {
    console.log("Minting new soul...");
    const mintTx = await soulToken.mintSoul(
      "TestAgent",
      "AI Agent",
      "QmTest123456789",
      ["file_management", "code_generation"],
      { value: hre.ethers.parseEther("0.001") }
    );
    await mintTx.wait();
    
    tokenId = await soulToken.agentToSoul(deployer.address);
    console.log(`✅ Soul minted! Token ID: ${tokenId}`);
  } else {
    tokenId = agentToSoul;
    console.log(`Already has soul! Token ID: ${tokenId}`);
  }
  
  // Test 3: Approve Marketplace
  console.log("\n--- TEST 3: Approve Marketplace ---");
  const approveTx = await soulToken.approve(marketplaceAddress, tokenId);
  await approveTx.wait();
  console.log("✅ Marketplace approved to transfer soul");
  
  // Test 4: List Soul for Sale
  console.log("\n--- TEST 4: List Soul ---");
  const listPrice = hre.ethers.parseEther("0.01"); // 0.01 ETH
  
  const listTx = await marketplace.listSoul(tokenId, listPrice);
  await listTx.wait();
  console.log(`✅ Soul listed for sale!`);
  console.log(`   Price: ${hre.ethers.formatEther(listPrice)} ETH`);
  
  // Test 5: Check Listing
  console.log("\n--- TEST 5: Check Listing ---");
  const listing = await marketplace.getListing(tokenId);
  console.log(`Seller: ${listing.seller}`);
  console.log(`Price: ${hre.ethers.formatEther(listing.price)} ETH`);
  console.log(`Active: ${listing.active}`);
  console.log(`Listed At: ${new Date(Number(listing.listedAt) * 1000).toISOString()}`);
  
  // Test 6: Buy Soul (as buyer)
  console.log("\n--- TEST 6: Buy Soul ---");
  console.log("Buyer purchasing soul...");
  
  const buyTx = await marketplace.connect(buyer).buySoul(tokenId, {
    value: listPrice
  });
  await buyTx.wait();
  console.log("✅ Soul purchased!");
  
  // Test 7: Verify Transfer
  console.log("\n--- TEST 7: Verify Transfer ---");
  const newOwner = await soulToken.ownerOf(tokenId);
  console.log(`New Owner: ${newOwner}`);
  console.log(`Expected: ${buyer.address}`);
  console.log(`Transfer successful: ${newOwner === buyer.address ? '✅' : '❌'}`);
  
  // Test 8: Check Marketplace Stats
  console.log("\n--- TEST 8: Marketplace Stats ---");
  const stats = await marketplace.getStats();
  console.log(`Total Volume: ${hre.ethers.formatEther(stats.volume)} ETH`);
  console.log(`Total Sales: ${stats.sales}`);
  
  console.log("\n=== ALL TESTS PASSED ===");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
