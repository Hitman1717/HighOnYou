import { parseStravaShareText, formatStravaApiActivity } from './stravaParser';

const STRAVA_TOKEN_KEY = 'highonyou_strava_token';

export function getStoredStravaToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STRAVA_TOKEN_KEY) || import.meta.env.VITE_STRAVA_ACCESS_TOKEN || '';
}

export function setStoredStravaToken(token) {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(STRAVA_TOKEN_KEY, token.trim());
  } else {
    localStorage.removeItem(STRAVA_TOKEN_KEY);
  }
}

/**
 * Fetch activity from Strava API v3 via our backend proxy
 */
export async function fetchStravaActivity(activityId, customToken = null) {
  const token = customToken || getStoredStravaToken();

  if (!activityId) {
    throw new Error('Activity ID is required to fetch from Strava API.');
  }

  if (!token) {
    throw new Error('Strava Access Token is required for direct API fetching.');
  }

  const endpoint = `/api/strava?activityId=${encodeURIComponent(activityId)}&token=${encodeURIComponent(token)}`;

  const res = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Strava API request failed with status ${res.status}`);
  }

  return formatStravaApiActivity(data);
}

/**
 * Smart pipeline: parses text/links and enhances with Strava API when possible
 */
export async function processStravaWorkout(inputText, options = {}) {
  const { fallbackDate = new Date().toISOString().split('T')[0], allowApi = true } = options;

  // 1. Parse text / link locally
  const parsed = parseStravaShareText(inputText, fallbackDate);
  if (!parsed) {
    throw new Error('Could not parse any workout data from the text provided.');
  }

  // 2. If activity ID exists and Strava token is available, try augmenting with Strava API v3
  const token = getStoredStravaToken();
  if (allowApi && parsed.activityId && token) {
    try {
      const apiResult = await fetchStravaActivity(parsed.activityId, token);
      if (apiResult) {
        return {
          ...parsed,
          ...apiResult,
          // If the user's share text had a specific custom title, preserve it if API returned generic
          title: parsed.title && parsed.title !== 'Strava Run' ? parsed.title : apiResult.title,
          source: 'Strava API v3'
        };
      }
    } catch (apiErr) {
      console.warn('Strava API enhancement failed, using parsed share text instead:', apiErr.message);
      // Return parsed with warning
      return {
        ...parsed,
        source: 'Smart Parser (Share Text / Link)',
        apiWarning: apiErr.message
      };
    }
  }

  return {
    ...parsed,
    source: 'Smart Parser (Share Text / Link)'
  };
}
