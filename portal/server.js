require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const PORT = parseInt(process.env.PORT || "3001", 10);

// Append-only log (NDJSON)
const LOG_PATH = path.join(__dirname, "audit-log.ndjson");

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

// Read last N events from NDJSON (best-effort; fine for class)
function readLastEvents(limit = 200) {
  try {
    if (!fs.existsSync(LOG_PATH)) return [];
    const lines = fs.readFileSync(LOG_PATH, "utf8")
      .split("\n")
      .filter(Boolean);

    const slice = lines.slice(Math.max(0, lines.length - limit));
    return slice.map(l => {
      try { return JSON.parse(l); } catch { return null; }
    }).filter(Boolean);
  } catch {
    return [];
  }
}

// ---------- Routes ----------
app.get("/api/status", async (_req, res) => {
  res.json({
    ok: true,
    mode: "NO_BLOCKCHAIN",
    logPath: "audit-log.ndjson",
    note: "Render free tier storage is ephemeral; logs can reset on restart."
  });
});

// Fetch recent events (viewer can poll this)
app.get("/api/events", (req, res) => {
  const limit = Math.min(1000, Math.max(1, parseInt(req.query.limit || "200", 10)));
  res.json({ ok: true, events: readLastEvents(limit) });
});

// Submit event (append-only)
app.post("/api/submit", async (req, res) => {
  try {
    const { role, pin, tag, eventType, payload } = req.body || {};

    if (!role || !allowed[role]) return res.status(400).json({ ok:false, error:"Invalid role" });
    if (!tag || typeof tag !== "string") return res.status(400).json({ ok:false, error:"Missing tag" });
    if (!eventType || typeof eventType !== "string") return res.status(400).json({ ok:false, error:"Missing eventType" });

    if (!allowed[role].has(eventType)) {
      return res.status(403).json({ ok:false, error:`Role ${role} not allowed to submit ${eventType}` });
    }

    if (!checkPin(role, pin)) {
      return res.status(401).json({ ok:false, error:"Invalid PIN for selected role" });
    }

    // Require reference for VOIDED/CORRECTED
    const needsRef = /_(VOIDED|CORRECTED)$/.test(eventType);
    if (needsRef) {
      const ref = payload?.correctsEventId || payload?.correctsTxHash; // keep compatibility with your earlier idea
      if (!ref) {
        return res.status(400).json({ ok:false, error:`${eventType} requires payload.correctsEventId (or correctsTxHash)` });
      }
    }

    const now = new Date().toISOString();
    const eventId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const record = {
      at: now,
      eventId,
      role,
      tag,
      eventType,
      payload: payload ?? {},
      payloadJson: safeJsonStringify(payload ?? {}),
      submittedBy: role, // no wallets in this mode
      mode: "NO_BLOCKCHAIN"
    };

    fs.appendFileSync(LOG_PATH, JSON.stringify(record) + "\n", "utf8");

    res.json({ ok: true, eventId });
  } catch (e) {
    res.status(500).json({ ok:false, error: String(e) });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Portal running on port ${PORT} (NO_BLOCKCHAIN)`);
});
