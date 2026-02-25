const hre = require('hardhat');

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const feeRecipient = process.env.FEE_RECIPIENT || deployer.address;
  const mintFee = process.env.MINT_FEE_WEI || hre.ethers.parseEther('0.00001');

  console.log('Network:', hre.network.name);
  console.log('Deployer:', deployer.address);
  console.log('Mint fee (wei):', mintFee.toString());

  const SoulTokenV2 = await hre.ethers.getContractFactory('SoulTokenV2');
  const soul = await SoulTokenV2.deploy(feeRecipient, mintFee);
  await soul.waitForDeployment();

  const SoulMarketplace = await hre.ethers.getContractFactory('SoulMarketplace');
  const market = await SoulMarketplace.deploy(await soul.getAddress(), feeRecipient);
  await market.waitForDeployment();

  const out = {
    network: hre.network.name,
    chainId: Number(await hre.network.provider.request({ method: 'eth_chainId' })),
    deployer: deployer.address,
    feeRecipient,
    mintFeeWei: mintFee.toString(),
    contracts: {
      SoulTokenV2: await soul.getAddress(),
      SoulMarketplaceV2: await market.getAddress(),
    },
    timestamp: new Date().toISOString(),
  };

  const fs = require('fs');
  fs.writeFileSync('./deployment_v2.json', JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
