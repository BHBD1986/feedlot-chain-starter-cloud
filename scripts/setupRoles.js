const hre = require("hardhat");

async function main() {
  const signers = await hre.ethers.getSigners();
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
  console.error("Set env var CONTRACT_ADDRESS first (PowerShell): $env:CONTRACT_ADDRESS='0x...'");
  process.exit(1);
  }


  const ledger = await hre.ethers.getContractAt("FeedlotLedger", contractAddress);

  const roles = {
    FEEDLOT_ROLE: await ledger.FEEDLOT_ROLE(),
    SCALE_ROLE: await ledger.SCALE_ROLE(),
    VET_ROLE: await ledger.VET_ROLE(),
    NUTRITION_ROLE: await ledger.NUTRITION_ROLE(),
    TRUCK_ROLE: await ledger.TRUCK_ROLE(),
    PACKER_ROLE: await ledger.PACKER_ROLE(),
  };

  const mapping = [
    { role: "FEEDLOT_ROLE", idx: 1 },
    { role: "SCALE_ROLE", idx: 2 },
    { role: "VET_ROLE", idx: 3 },
    { role: "NUTRITION_ROLE", idx: 4 },
    { role: "TRUCK_ROLE", idx: 5 },
    { role: "PACKER_ROLE", idx: 6 },
  ];

  for (const m of mapping) {
    const acct = await signers[m.idx].getAddress();
    const tx = await ledger.grantRoles(acct, [roles[m.role]]);
    await tx.wait();
    console.log(`Granted ${m.role} to acct[${m.idx}] ${acct}`);
  }
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
