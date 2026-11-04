// Vercel Serverless Function: Proxy Strava API requests to avoid browser CORS restrictions
export default async function handler(req, res) {
  // Set CORS headers so client can call this function
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { activityId } = req.query;
  const token =
    req.headers.authorization?.replace(/^Bearer\s+/i, '') ||
    req.query.token ||
    process.env.STRAVA_ACCESS_TOKEN ||
    process.env.VITE_STRAVA_ACCESS_TOKEN;

  if (!activityId) {
    return res.status(400).json({ error: 'Missing activityId query parameter' });
  }

  if (!token) {
    return res.status(401).json({
      error: 'Missing Strava Access Token. Please provide a token with activity:read permissions.'
    });
  }

  try {
    const stravaRes = await fetch(
      `https://www.strava.com/api/v3/activities/${activityId}?include_all_efforts=false`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      }
    );

    const data = await stravaRes.json();

    if (!stravaRes.ok) {
      return res.status(stravaRes.status).json({
        error: data.message || `Strava API returned status ${stravaRes.status}`,
        details: data
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to contact Strava API', message: err.message });
  }
}
