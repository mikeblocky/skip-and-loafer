# Security

## Reporting a problem

Found something? Email mibeblocky@gmail.com with the details and how to
reproduce it. I'll usually reply within a few days. Please don't open a public
issue for anything that could be exploited until it's been fixed.

## TLS and the edge

The site runs on Cloudflare Workers behind the `mikeblocky.com` zone, so
Cloudflare terminates TLS — not the Worker or the origin. That means scanners
report on Cloudflare's edge config, and the fix lives in the zone settings, not
in this repo.

Current expectations for the zone:

- Minimum TLS version is 1.2. Anything older still offers 3DES, which trips
  SWEET32 (CVE-2016-2183), so 1.0 and 1.1 stay off.
- TLS 1.3 is on.

`scripts/set-min-tls.mjs` applies both with a scoped API token if they ever
drift. A vulnerability scan flagging TLS 1.0/1.1 or 3DES means the zone setting
got changed, not the code.

One thing scanners flag that we don't fix: TCP timestamps. That's Cloudflare's
network stack, it only leaks edge-node uptime, and it isn't something we can
turn off. Treat it as accepted.
