const hre = require("hardhat");

async function estimateCosts() {
  console.log("💰 ESTIMATING DEPLOYMENT COSTS ON BASE MAINNET\n");
  
  // Get contract factories
  const SoulToken = await hre.ethers.getContractFactory("SoulToken");
  const SoulMarketplace = await hre.ethers.getContractFactory("SoulMarketplace");
  const SoulComputeNetwork = await hre.ethers.getContractFactory("SoulComputeNetwork");
  
  const feeRecipient = "0xBe5DAd52427Fa812C198365AAb6fe916E1a61269";
  
  // Get deployment transaction data
  const soulTokenDeploy = await SoulToken.getDeployTransaction(feeRecipient);
  const marketplaceDeploy = await SoulMarketplace.getDeployTransaction(
    "0x0000000000000000000000000000000000000001", // placeholder
    feeRecipient
  );
  const computeDeploy = await SoulComputeNetwork.getDeployTransaction(feeRecipient);
  
  // Estimate gas
  const provider = hre.ethers.provider;
  const gasPrice = await provider.getFeeData();
  
  console.log("Current Gas Price:", hre.ethers.formatUnits(gasPrice.gasPrice || 1000000000n, "gwei"), "gwei");
  console.log("");
  
  // Estimate each contract
  const estimates = [];
  
  // SoulToken
  const soulTokenGas = await provider.estimateGas({
    data: soulTokenDeploy.data
  });
  estimates.push({
    name: "SoulToken",
    gas: soulTokenGas,
    bytes: (soulTokenDeploy.data.length - 2) / 2
  });
  
  // SoulMarketplace
  const marketplaceGas = await provider.estimateGas({
    data: marketplaceDeploy.data
  });
  estimates.push({
    name: "SoulMarketplace",
    gas: marketplaceGas,
    bytes: (marketplaceDeploy.data.length - 2) / 2
  });
  
  // SoulComputeNetwork
  const computeGas = await provider.estimateGas({
    data: computeDeploy.data
  });
  estimates.push({
    name: "SoulComputeNetwork",
    gas: computeGas,
    bytes: (computeDeploy.data.length - 2) / 2
  });
  
  // Calculate costs at different gas prices
  const gasPrices = [
    { name: "Low (0.1 gwei)", price: 100000000n },
    { name: "Medium (0.5 gwei)", price: 500000000n },
    { name: "High (1 gwei)", price: 1000000000n },
    { name: "Very High (2 gwei)", price: 2000000000n }
  ];
  
  console.log("═══════════════════════════════════════════════════════════");
  console.log("📊 DEPLOYMENT COST ESTIMATES");
  console.log("═══════════════════════════════════════════════════════════\n");
  
  for (const gasPriceInfo of gasPrices) {
    console.log(`\n${gasPriceInfo.name}:`);
    console.log("─".repeat(50));
    
    let totalCost = 0n;
    
    for (const est of estimates) {
      const cost = est.gas * gasPriceInfo.price;
      totalCost += cost;
      console.log(`${est.name}:`);
      console.log(`  Gas: ${est.gas.toLocaleString()}`);
      console.log(`  Size: ${est.bytes.toLocaleString()} bytes`);
      console.log(`  Cost: ${hre.ethers.formatEther(cost)} ETH`);
      console.log(`  USD: $${(parseFloat(hre.ethers.formatEther(cost)) * 2300).toFixed(2)}`);
      console.log("");
    }
    
    console.log(`TOTAL:`);
    console.log(`  Cost: ${hre.ethers.formatEther(totalCost)} ETH`);
    console.log(`  USD: $${(parseFloat(hre.ethers.formatEther(totalCost)) * 2300).toFixed(2)}`);
    console.log("");
  }
  
  // Check if under $5
  const lowCost = estimates.reduce((sum, est) => sum + est.gas, 0n) * 100000000n;
  const mediumCost = estimates.reduce((sum, est) => sum + est.gas, 0n) * 500000000n;
  
  console.log("═══════════════════════════════════════════════════════════");
  console.log("✅ FEASIBILITY CHECK (< $5):");
  console.log("═══════════════════════════════════════════════════════════\n");
  
  const lowUSD = parseFloat(hre.ethers.formatEther(lowCost)) * 2300;
  const mediumUSD = parseFloat(hre.ethers.formatEther(mediumCost)) * 2300;
  
  console.log(`At Low Gas Price: $${lowUSD.toFixed(2)} ${lowUSD < 5 ? '✅ UNDER $5' : '❌ OVER $5'}`);
  console.log(`At Medium Gas Price: $${mediumUSD.toFixed(2)} ${mediumUSD < 5 ? '✅ UNDER $5' : '❌ OVER $5'}`);
  
  if (lowUSD < 5) {
    console.log("\n✅ RECOMMENDATION: Deploy during low gas periods");
    console.log("   Best time: Early morning EST (2-6 AM)");
    console.log("   Weekends are usually cheaper");
  } else {
    console.log("\n⚠️  WARNING: Deployment costs over $5");
    console.log("   Consider optimizing contracts or waiting for lower gas");
  }
}

estimateCosts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
