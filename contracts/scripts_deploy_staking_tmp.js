const hre=require('hardhat');
async function main(){
 const [deployer]=await hre.ethers.getSigners();
 const soul=process.env.SOUL_TOKEN_ADDRESS;
 if(!soul) throw new Error('SOUL_TOKEN_ADDRESS missing');
 console.log('deployer',deployer.address)
 const F=await hre.ethers.getContractFactory('SoulStaking');
 const c=await F.deploy(soul);
 await c.waitForDeployment();
 console.log('SoulStaking', await c.getAddress());
 console.log('tx', c.deploymentTransaction().hash);
}
main().catch(e=>{console.error(e);process.exit(1)})
