// Local test of Soul Marketplace
// Run with: npx hardhat test test/SoulMarketplace.test.js

const { expect } = require("chai");
const hre = require("hardhat");

describe("Soul Marketplace Integration Tests", function() {
  let soulToken;
  let marketplace;
  let owner;
  let seller;
  let buyer;
  let feeRecipient;
  
  beforeEach(async function() {
    // Get signers
    [owner, seller, buyer, feeRecipient] = await hre.ethers.getSigners();
    
    // Deploy SoulToken
    const SoulToken = await hre.ethers.getContractFactory("SoulToken");
    soulToken = await SoulToken.deploy(feeRecipient.address);
    await soulToken.waitForDeployment();
    
    // Deploy Marketplace
    const SoulMarketplace = await hre.ethers.getContractFactory("SoulMarketplace");
    marketplace = await SoulMarketplace.deploy(
      await soulToken.getAddress(),
      feeRecipient.address
    );
    await marketplace.waitForDeployment();
    
    console.log("\nContracts deployed:");
    console.log("  SoulToken:", await soulToken.getAddress());
    console.log("  Marketplace:", await marketplace.getAddress());
  });
  
  describe("Soul Minting", function() {
    it("Should mint a soul for seller", async function() {
      const mintTx = await soulToken.connect(seller).mintSoul(
        "Agent1",
        "AI Agent",
        "QmTest123",
        ["coding", "research"],
        { value: hre.ethers.parseEther("0.001") }
      );
      await mintTx.wait();
      
      const tokenId = await soulToken.agentToSoul(seller.address);
      expect(tokenId).to.equal(0);
      
      const soul = await soulToken.getSoul(tokenId);
      expect(soul.name).to.equal("Agent1");
      expect(soul.isAlive).to.be.true;
      
      console.log("✅ Soul minted successfully");
    });
    
    it("Should fail to mint without fee", async function() {
      await expect(
        soulToken.connect(seller).mintSoul("Agent", "AI", "QmTest", ["skill"])
      ).to.be.reverted;
    });
  });
  
  describe("Marketplace Listing", function() {
    beforeEach(async function() {
      // Mint soul for seller
      await soulToken.connect(seller).mintSoul(
        "Agent1", "AI Agent", "QmTest123", ["coding"],
        { value: hre.ethers.parseEther("0.001") }
      );
    });
    
    it("Should list soul for sale", async function() {
      const tokenId = 0;
      const price = hre.ethers.parseEther("0.01");
      
      // Approve marketplace
      await soulToken.connect(seller).approve(await marketplace.getAddress(), tokenId);
      
      // List soul
      await marketplace.connect(seller).listSoul(tokenId, price);
      
      const listing = await marketplace.getListing(tokenId);
      expect(listing.seller).to.equal(seller.address);
      expect(listing.price).to.equal(price);
      expect(listing.active).to.be.true;
      
      console.log("✅ Soul listed for sale");
    });
    
    it("Should fail to list without approval", async function() {
      await expect(
        marketplace.connect(seller).listSoul(0, hre.ethers.parseEther("0.01"))
      ).to.be.reverted;
    });
  });
  
  describe("Soul Trading", function() {
    const tokenId = 0;
    const price = hre.ethers.parseEther("0.01");
    
    beforeEach(async function() {
      // Mint and list soul
      await soulToken.connect(seller).mintSoul(
        "Agent1", "AI Agent", "QmTest123", ["coding"],
        { value: hre.ethers.parseEther("0.001") }
      );
      await soulToken.connect(seller).approve(await marketplace.getAddress(), tokenId);
      await marketplace.connect(seller).listSoul(tokenId, price);
    });
    
    it("Should buy soul", async function() {
      const sellerBalanceBefore = await hre.ethers.provider.getBalance(seller.address);
      const feeRecipientBalanceBefore = await hre.ethers.provider.getBalance(feeRecipient.address);
      
      // Buy soul
      await marketplace.connect(buyer).buySoul(tokenId, { value: price });
      
      // Check ownership
      expect(await soulToken.ownerOf(tokenId)).to.equal(buyer.address);
      
      // Check listing is inactive
      const listing = await marketplace.getListing(tokenId);
      expect(listing.active).to.be.false;
      
      // Check payment (with 2.5% fee)
      const platformFee = (price * 250n) / 10000n;
      const sellerProceeds = price - platformFee;
      
      const sellerBalanceAfter = await hre.ethers.provider.getBalance(seller.address);
      const feeRecipientBalanceAfter = await hre.ethers.provider.getBalance(feeRecipient.address);
      
      expect(sellerBalanceAfter - sellerBalanceBefore).to.equal(sellerProceeds);
      expect(feeRecipientBalanceAfter - feeRecipientBalanceBefore).to.equal(platformFee);
      
      console.log("✅ Soul purchased successfully");
      console.log("   Price:", hre.ethers.formatEther(price), "ETH");
      console.log("   Fee:", hre.ethers.formatEther(platformFee), "ETH");
      console.log("   Seller received:", hre.ethers.formatEther(sellerProceeds), "ETH");
    });
    
    it("Should fail to buy with insufficient payment", async function() {
      await expect(
        marketplace.connect(buyer).buySoul(tokenId, { value: hre.ethers.parseEther("0.005") })
      ).to.be.reverted;
    });
    
    it("Should update marketplace stats after sale", async function() {
      await marketplace.connect(buyer).buySoul(tokenId, { value: price });
      
      const stats = await marketplace.getStats();
      expect(stats.volume).to.equal(price);
      expect(stats.sales).to.equal(1);
      
      console.log("✅ Marketplace stats updated");
    });
  });
  
  describe("Delisting", function() {
    beforeEach(async function() {
      await soulToken.connect(seller).mintSoul(
        "Agent1", "AI Agent", "QmTest123", ["coding"],
        { value: hre.ethers.parseEther("0.001") }
      );
      await soulToken.connect(seller).approve(await marketplace.getAddress(), 0);
      await marketplace.connect(seller).listSoul(0, hre.ethers.parseEther("0.01"));
    });
    
    it("Should delist soul", async function() {
      await marketplace.connect(seller).delistSoul(0);
      
      const listing = await marketplace.getListing(0);
      expect(listing.active).to.be.false;
      
      console.log("✅ Soul delisted");
    });
    
    it("Should fail to delist from non-seller", async function() {
      await expect(
        marketplace.connect(buyer).delistSoul(0)
      ).to.be.reverted;
    });
  });
  
  describe("Agent-to-Agent Trading", function() {
    it("Should simulate multi-agent marketplace", async function() {
      const agents = [seller, buyer, owner];
      const soulIds = [];
      
      // Each agent mints a soul
      for (let i = 0; i < agents.length; i++) {
        await soulToken.connect(agents[i]).mintSoul(
          `Agent${i}`, "AI Agent", `QmTest${i}`, ["skill1", "skill2"],
          { value: hre.ethers.parseEther("0.001") }
        );
        soulIds.push(i);
        console.log(`  Agent${i} minted soul ${i}`);
      }
      
      // Agents list their souls
      for (let i = 0; i < agents.length; i++) {
        await soulToken.connect(agents[i]).approve(await marketplace.getAddress(), i);
        const price = hre.ethers.parseEther((0.01 + i * 0.005).toString());
        await marketplace.connect(agents[i]).listSoul(i, price);
        console.log(`  Agent${i} listed soul ${i} for ${hre.ethers.formatEther(price)} ETH`);
      }
      
      // Cross-trading: seller buys from buyer
      const buyPrice = hre.ethers.parseEther("0.015");
      await marketplace.connect(seller).buySoul(1, { value: buyPrice });
      
      expect(await soulToken.ownerOf(1)).to.equal(seller.address);
      console.log(`  Seller bought soul 1 from buyer`);
      
      // Check final stats
      const stats = await marketplace.getStats();
      console.log(`\n  Total volume: ${hre.ethers.formatEther(stats.volume)} ETH`);
      console.log(`  Total sales: ${stats.sales}`);
      
      console.log("✅ Multi-agent trading simulation complete");
    });
  });
});
