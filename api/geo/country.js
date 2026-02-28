export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const raw = req.headers['x-vercel-ip-country']
        || req.headers['cf-ipcountry']
        || req.headers['x-country-code']
        || '';

    const countryCode = String(raw).trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(countryCode)) {
        return res.status(200).json({ countryCode: null });
    }

    return res.status(200).json({ countryCode });
}
