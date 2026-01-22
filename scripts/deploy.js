const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const FeedlotLedger = await hre.ethers.getContractFactory("FeedlotLedger");
  const ledger = await FeedlotLedger.deploy(deployer.address);
  await ledger.waitForDeployment();
  console.log("FeedlotLedger deployed to:", await ledger.getAddress());
  console.log("Admin:", deployer.address);
}
main().catch((e) => { console.error(e); process.exitCode = 1; });
