const hre = require("hardhat");

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const idx = parseInt(process.env.SIGNER_INDEX || "1", 10);
  const tag = process.env.TAG;
  const eventType = process.env.EVENT_TYPE;
  const payload = process.env.PAYLOAD || "{}";
  const docHash = "0x" + "0".repeat(64);

  if (!contractAddress || !tag || !eventType) {
    console.error("Missing env vars. Set: CONTRACT_ADDRESS, TAG, EVENT_TYPE. Optional: SIGNER_INDEX, PAYLOAD");
    process.exit(1);
  }

  const signers = await hre.ethers.getSigners();
  const signer = signers[idx];

  const ledger = await hre.ethers.getContractAt("FeedlotLedger", contractAddress, signer);

  const tx = await ledger.logEvent(tag, eventType, payload, docHash);
  await tx.wait();

  console.log("Event written. TX:", tx.hash);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
