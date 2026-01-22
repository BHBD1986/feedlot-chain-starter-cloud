require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");

const fs = require("fs");
const path = require("path");
const LOG_PATH = path.join(__dirname, "audit-log.ndjson");


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

if (!CONTRACT_ADDRESS) {
  console.error("Missing CONTRACT_ADDRESS in .env");
  process.exit(1);
}

// Minimal ABI: only what we need
const ABI = [
  "function logEvent(string tag, string eventType, string payloadJson, bytes32 docHash) external returns (uint256)",
  "event LedgerEvent(uint256 indexed eventId, string indexed tag, string eventType, uint64 timestamp, address indexed submittedBy, string payloadJson, bytes32 docHash)"
];

const provider = new ethers.JsonRpcProvider(RPC_URL);

// ---------- Wallet derivation from MNEMONIC ----------
const mnemonic = process.env.MNEMONIC;
if (!mnemonic) {
  console.error("MNEMONIC missing from portal .env");
  process.exit(1);
}

function walletAt(index) {
  const path = `m/44'/60'/0'/0/${index}`;
  return ethers.HDNodeWallet.fromPhrase(mnemonic, undefined, path).connect(provider);
}

const roleIndex = {
  FEEDLOT: Number(process.env.ROLE_INDEX_FEEDLOT || 1),
  SCALE: Number(process.env.ROLE_INDEX_SCALE || 2),
  VET: Number(process.env.ROLE_INDEX_VET || 3),
  NUTRITION: Number(process.env.ROLE_INDEX_NUTRITION || 4),
  TRUCK: Number(process.env.ROLE_INDEX_TRUCK || 5),
  PACKER: Number(process.env.ROLE_INDEX_PACKER || 6),
};

const wallets = {
  FEEDLOT: walletAt(roleIndex.FEEDLOT),
  SCALE: walletAt(roleIndex.SCALE),
  VET: walletAt(roleIndex.VET),
  NUTRITION: walletAt(roleIndex.NUTRITION),
  TRUCK: walletAt(roleIndex.TRUCK),
  PACKER: walletAt(roleIndex.PACKER),
};

// Debug: verify role addresses match Hardhat accounts #1..#6
console.log("FEEDLOT:", wallets.FEEDLOT.address);
console.log("SCALE:", wallets.SCALE.address);
console.log("VET:", wallets.VET.address);
console.log("NUTRITION:", wallets.NUTRITION.address);
console.log("TRUCK:", wallets.TRUCK.address);
console.log("PACKER:", wallets.PACKER.address);

// ---------- Policy + PINs ----------
const allowed = {
  FEEDLOT: new Set(["ANIMAL_REGISTERED","ARRIVAL_RECORDED","PEN_MOVED","SHIP_OUT"]),
  SCALE: new Set(["WEIGH_IN","WEIGH_OUT","WEIGH_VOIDED","WEIGH_CORRECTED"]),
  VET: new Set(["TREATMENT_ADMINISTERED","TREATMENT_VOIDED"]),
  NUTRITION: new Set(["RATION_DEFINED","RATION_ASSIGNED","FEED_DELIVERED"]),
  TRUCK: new Set(["PICKUP_RECORDED","DELIVERY_RECORDED"]),
  PACKER: new Set(["RECEIVED_AT_PACKER"]),
};

const pins = {
  FEEDLOT: process.env.PIN_FEEDLOT,
  SCALE: process.env.PIN_SCALE,
  VET: process.env.PIN_VET,
  NUTRITION: process.env.PIN_NUTRITION,
  TRUCK: process.env.PIN_TRUCK,
  PACKER: process.env.PIN_PACKER,
};

function checkPin(role, pin) {
  const expected = pins[role];
  return expected && String(pin || "").trim() === String(expected).trim();
}

function safeJsonStringify(x) {
  if (typeof x === "string") return x;
  return JSON.stringify(x);
}

// ---------- Routes ----------
app.get("/api/status", async (_req, res) => {
  try {
    const block = await provider.getBlockNumber();
    res.json({
      ok: true,
      rpc: RPC_URL,
      contract: CONTRACT_ADDRESS,
      blockNumber: block
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

app.post("/api/submit", async (req, res) => {
  try {
    const { role, pin, tag, eventType, payload } = req.body || {};

    if (!role || !wallets[role]) return res.status(400).json({ ok:false, error:"Invalid role" });
    if (!tag || typeof tag !== "string") return res.status(400).json({ ok:false, error:"Missing tag" });
    if (!eventType || typeof eventType !== "string") return res.status(400).json({ ok:false, error:"Missing eventType" });

    if (!allowed[role] || !allowed[role].has(eventType)) {
      return res.status(403).json({ ok:false, error:`Role ${role} not allowed to submit ${eventType}` });
    }

    if (!checkPin(role, pin)) {
      return res.status(401).json({ ok:false, error:"Invalid PIN for selected role" });
    }

    const needsRef = /_(VOIDED|CORRECTED)$/.test(eventType);
if (needsRef) {
  const ref = payload?.correctsTxHash || payload?.correctsEventId;
  if (!ref) {
    return res.status(400).json({ ok:false, error:`${eventType} requires payload.correctsTxHash or payload.correctsEventId` });
  }
}

    const payloadJson = safeJsonStringify(payload ?? {});
    const docHash = "0x" + "0".repeat(64);

    const signer = wallets[role];
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    const tx = await contract.logEvent(tag, eventType, payloadJson, docHash);
    const receipt = await tx.wait();

    fs.appendFileSync(
  LOG_PATH,
  JSON.stringify({
    at: new Date().toISOString(),
    role,
    tag,
    eventType,
    payload,
    txHash: tx.hash,
    blockNumber: receipt.blockNumber,
    submittedBy: await signer.getAddress(),
    contract: CONTRACT_ADDRESS
  }) + "\n",
  "utf8"
);


    res.json({
      ok: true,
      txHash: tx.hash,
      blockNumber: receipt.blockNumber,
      submittedBy: await signer.getAddress()
    });
  } catch (e) {
    res.status(500).json({ ok:false, error: String(e) });
  }
});

const PORT = parseInt(process.env.PORT || "3001", 10);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Portal running on port ${PORT}`);
});
