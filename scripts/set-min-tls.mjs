#!/usr/bin/env node
// Raises the Cloudflare edge TLS posture for the zone so old protocols and
// weak ciphers stop being offered. This is what clears the HostedScan
// findings (3DES/SWEET32 + TLS 1.0/1.1) — they live at the edge, not in code.
//
// Needs an API token with Zone -> SSL and Certificates -> Edit on the zone.
// Usage:
//   CF_API_TOKEN=xxx CF_ZONE=mikeblocky.com node scripts/set-min-tls.mjs
//   CF_API_TOKEN=xxx CF_ZONE_ID=<id>      node scripts/set-min-tls.mjs

const token = process.env.CF_API_TOKEN;
const zoneName = process.env.CF_ZONE;
let zoneId = process.env.CF_ZONE_ID;

if (!token) {
  console.error("Set CF_API_TOKEN (Zone -> SSL and Certificates -> Edit).");
  process.exit(1);
}
if (!zoneId && !zoneName) {
  console.error("Set CF_ZONE (e.g. mikeblocky.com) or CF_ZONE_ID.");
  process.exit(1);
}

const api = "https://api.cloudflare.com/client/v4";
const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

async function cf(path, init) {
  const res = await fetch(`${api}${path}`, { headers, ...init });
  const body = await res.json();
  if (!body.success) {
    const msg = (body.errors || []).map((e) => `${e.code} ${e.message}`).join("; ");
    throw new Error(`${path} failed: ${msg || res.status}`);
  }
  return body.result;
}

if (!zoneId) {
  const zones = await cf(`/zones?name=${encodeURIComponent(zoneName)}`);
  if (!zones.length) throw new Error(`Zone not found: ${zoneName}`);
  zoneId = zones[0].id;
  console.log(`Resolved ${zoneName} -> ${zoneId}`);
}

// Floor at TLS 1.2: 3DES is only ever offered on 1.0/1.1, so this kills both
// the High (SWEET32) and Medium (deprecated protocol) findings at once.
await cf(`/zones/${zoneId}/settings/min_tls_version`, {
  method: "PATCH",
  body: JSON.stringify({ value: "1.2" }),
});
console.log("min_tls_version -> 1.2");

// Make sure 1.3 is on so modern clients get the best handshake.
await cf(`/zones/${zoneId}/settings/tls_1_3`, {
  method: "PATCH",
  body: JSON.stringify({ value: "on" }),
});
console.log("tls_1_3 -> on");

console.log("Done. Re-run the scan to confirm.");
