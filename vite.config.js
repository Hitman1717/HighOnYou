import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'local-strava-proxy',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (!req.url.startsWith('/api/strava')) {
            return next();
          }

          const urlObj = new URL(req.url, 'http://localhost');
          const activityId = urlObj.searchParams.get('activityId');
          const token =
            req.headers.authorization?.replace(/^Bearer\s+/i, '') ||
            urlObj.searchParams.get('token') ||
            process.env.VITE_STRAVA_ACCESS_TOKEN;

          res.setHeader('Content-Type', 'application/json');

          if (!activityId) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Missing activityId' }));
            return;
          }

          if (!token) {
            res.statusCode = 401;
            res.end(JSON.stringify({ error: 'Missing Strava token' }));
            return;
          }

          try {
            const stravaRes = await fetch(
              `https://www.strava.com/api/v3/activities/${activityId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: 'application/json'
                }
              }
            );
            const data = await stravaRes.json();
            res.statusCode = stravaRes.status;
            res.end(JSON.stringify(data));
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
        });
      }
    }
  ]
});
