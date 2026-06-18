export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  // Country rarely changes per session — cache at edge for 5 minutes
  res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const raw = req.headers['x-nf-country']         // Netlify
    || req.headers['x-country']                    // Netlify alt
    || req.headers['cf-ipcountry']                 // Cloudflare
    || req.headers['x-vercel-ip-country']          // Vercel (legacy)
    || req.headers['x-country-code']
    || '';

  const countryCode = String(raw).trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(countryCode)) {
    return res.status(200).json({ countryCode: null });
  }

  return res.status(200).json({ countryCode });
}
