/**
 * Strava Share & Activity Parser Utility
 * Extracts workout details from Strava share text, activity links, or Strava API payloads.
 */

export function parseStravaShareText(text, fallbackDate = new Date().toISOString().split('T')[0]) {
  if (!text || typeof text !== 'string') return null;

  const raw = text.trim();
  const result = {
    title: 'Strava Run',
    date: fallbackDate,
    distanceKm: 0,
    durationMinutes: 0,
    durationSeconds: 0,
    pace: '--:--',
    elevationMeters: 0,
    avgHeartRate: null,
    maxHeartRate: null,
    calories: null,
    activityId: null,
    sourceUrl: null,
    routeType: 'Road',
    rawText: raw
  };

  // 1. Extract Strava URL & Activity ID
  const urlMatch = raw.match(/https?:\/\/(?:www\.)?(?:strava\.com\/activities\/\d+|strava\.app\.link\/[^\s,]+|strava\.com\/[^\s,]+)/i);
  if (urlMatch) {
    result.sourceUrl = urlMatch[0];
  }

  const idMatch = raw.match(/activities\/(\d{6,15})/i) || raw.match(/strava\.com\/activities\/(\d+)/i);
  if (idMatch) {
    result.activityId = idMatch[1];
  }

  // 2. Extract Title / Name
  // e.g. "Check out my run on Strava: Morning Run - 5.24 km"
  // or "Evening 10k Run - 10.02 km • 51m 20s"
  // or "I just finished a 5 km run with Strava: "Tempo Run""
  const quotedTitle = raw.match(/["“]([^"”]+)["”]/);
  if (quotedTitle && quotedTitle[1].trim().length > 1) {
    result.title = quotedTitle[1].trim();
  } else {
    // Check if starts with "Check out my run on Strava: Title - ..."
    const afterStravaColon = raw.match(/Strava:\s*([^\n\r-]+?)(?:\s*[-–•|]|\s*\d+[.,]\d+\s*(?:km|mi)|\s*https?:\/\/)/i);
    if (afterStravaColon && afterStravaColon[1].trim().length > 1) {
      result.title = afterStravaColon[1].trim();
    } else {
      // First line before separator
      const firstLine = raw.split(/\r?\n/)[0].trim();
      const strippedPrefix = firstLine
        .replace(/^Check out my (?:run|ride|workout|activity) on Strava:?\s*/i, '')
        .replace(/^I just finished a [^\n:]+ with Strava:?\s*/i, '');
      const parts = strippedPrefix.split(/\s*[-–•|]\s*/);
      if (parts[0] && parts[0].trim().length > 1 && !parts[0].startsWith('http') && !/^\d+[.,]?\d*\s*(km|mi)/i.test(parts[0])) {
        result.title = parts[0].trim();
      }
    }
  }

  // 3. Extract Distance (km or miles)
  const distMatch = raw.match(/([\d]+[.,][\d]+|\b\d+\b)\s*(km|kilometers|kilometres|mi|miles)\b/i) ||
                    raw.match(/(?:distance|dist)[:\s]+([\d]+[.,][\d]+|\b\d+\b)/i);
  if (distMatch) {
    const unit = (distMatch[2] || 'km').toLowerCase();
    let val = parseFloat(distMatch[1].replace(',', '.'));
    if (unit.startsWith('mi')) {
      val = val * 1.60934; // convert miles to km
    }
    result.distanceKm = Math.round(val * 100) / 100;
  }

  // 4. Extract Explicit Pace (e.g. "5:07 /km", "5:23/km", "8:15 /mi")
  let extractedPace = null;
  const paceMatch = raw.match(/\b(\d{1,2}:\d{2})\s*(?:\/km|min\/km|\/mi|min\/mi)\b/i) ||
                    raw.match(/(?:pace)[:\s]+(\d{1,2}:\d{2})/i);
  if (paceMatch) {
    extractedPace = paceMatch[1];
    // If pace is in min/mi, convert to min/km
    if (/(\/mi|min\/mi)/i.test(paceMatch[0])) {
      const [pM, pS] = paceMatch[1].split(':').map(Number);
      const totalSecPerMile = pM * 60 + pS;
      const totalSecPerKm = Math.round(totalSecPerMile / 1.60934);
      const kM = Math.floor(totalSecPerKm / 60);
      const kS = totalSecPerKm % 60;
      extractedPace = `${kM}:${kS < 10 ? '0' : ''}${kS}`;
    }
  }

  // 5. Extract Duration
  // Check for verbose: e.g. "1h 20m 15s", "51m 20s", "28m 15s", "45 mins"
  let hrs = 0;
  let mins = 0;
  let secs = 0;
  let foundDuration = false;

  const hrMatch = raw.match(/\b(\d+)\s*(?:h|hr|hours?)\b/i);
  const minMatch = raw.match(/\b(\d+)\s*(?:m|min|minutes?)\b/i);
  const secMatch = raw.match(/\b(\d+)\s*(?:s|sec|seconds?)\b/i);

  if (hrMatch || minMatch) {
    hrs = hrMatch ? parseInt(hrMatch[1]) : 0;
    mins = minMatch ? parseInt(minMatch[1]) : 0;
    secs = secMatch ? parseInt(secMatch[1]) : 0;
    foundDuration = true;
  }

  // If not found via verbose, search for colon formatted time: "51:20", "1:15:30", "Time: 28:15"
  if (!foundDuration) {
    // Find all colon matches
    const allColonMatches = [...raw.matchAll(/(?:time|duration)?[:\s]*\b(\d{1,2}):(\d{2})(?::(\d{2}))?\b/gi)];
    for (const cm of allColonMatches) {
      const matchedStr = cm[0];
      // Skip if this match is immediately followed by pace indicator (/km, /mi)
      const afterMatch = raw.slice(cm.index + cm[0].length);
      if (/^\s*(?:\/km|\/mi|min\/km|min\/mi)/i.test(afterMatch)) {
        continue;
      }
      if (cm[3] !== undefined) {
        // HH:MM:SS
        hrs = parseInt(cm[1]) || 0;
        mins = parseInt(cm[2]) || 0;
        secs = parseInt(cm[3]) || 0;
      } else {
        // MM:SS
        mins = parseInt(cm[1]) || 0;
        secs = parseInt(cm[2]) || 0;
      }
      foundDuration = true;
      break;
    }
  }

  if (foundDuration) {
    result.durationMinutes = hrs * 60 + mins;
    result.durationSeconds = secs;
  }

  // 6. Calculate or assign Pace
  const totalSecs = result.durationMinutes * 60 + result.durationSeconds;
  if (result.distanceKm > 0 && totalSecs > 0) {
    const secPerKm = totalSecs / result.distanceKm;
    const pMins = Math.floor(secPerKm / 60);
    const pSecs = Math.floor(secPerKm % 60);
    result.pace = `${pMins}:${pSecs < 10 ? '0' : ''}${pSecs}`;
  } else if (extractedPace) {
    result.pace = extractedPace;
  }

  // If we had an extracted explicit pace and no duration, but we have distance, compute duration!
  if (!foundDuration && extractedPace && result.distanceKm > 0) {
    const [pM, pS] = extractedPace.split(':').map(Number);
    const secPerKm = pM * 60 + pS;
    const computedSecs = Math.round(secPerKm * result.distanceKm);
    result.durationMinutes = Math.floor(computedSecs / 60);
    result.durationSeconds = computedSecs % 60;
  }

  // 7. Extract Elevation
  const elevMatch = raw.match(/([\d]+[.,]?\d*)\s*(?:m|meters|ft|feet)?\s*(?:elev(?:ation)?|gain|climb)\b/i) ||
                    raw.match(/(?:elev(?:ation)?|gain)[:\s]+([\d]+[.,]?\d*)\s*(m|ft)?/i);
  if (elevMatch) {
    let elev = parseFloat(elevMatch[1].replace(',', '.'));
    if (elevMatch[2]?.toLowerCase() === 'ft' || /ft|feet/i.test(elevMatch[0])) {
      elev = elev * 0.3048; // ft to meters
    }
    result.elevationMeters = Math.round(elev);
  }

  // 8. Extract Heart Rate
  const hrValMatch = raw.match(/(?:avg\s*hr|heart\s*rate|hr)[:\s]*(\d{2,3})\s*(?:bpm)?/i);
  if (hrValMatch) {
    result.avgHeartRate = parseInt(hrValMatch[1]);
  }

  // 9. Extract Calories
  const calValMatch = raw.match(/(\d{2,4})\s*(?:kcal|cal|calories)/i);
  if (calValMatch) {
    result.calories = parseInt(calValMatch[1]);
  } else if (result.distanceKm > 0) {
    result.calories = Math.round(result.distanceKm * 68);
  }

  // 10. Extract Date if present
  const dateMatch = raw.match(/\b(20\d\d[-/]\d{1,2}[-/]\d{1,2})\b/);
  if (dateMatch) {
    result.date = dateMatch[1].replace(/\//g, '-');
  }

  // 11. Activity route / sport type
  if (/trail/i.test(raw)) result.routeType = 'Trail';
  else if (/treadmill/i.test(raw)) result.routeType = 'Treadmill';
  else if (/track/i.test(raw)) result.routeType = 'Track';
  else if (/ride|cycle|cycling/i.test(raw)) result.routeType = 'Ride';

  return result;
}

/**
 * Format a Strava API Activity v3 JSON response into our application's run model
 */
export function formatStravaApiActivity(apiActivity) {
  if (!apiActivity) return null;

  const distanceKm = apiActivity.distance ? Math.round((apiActivity.distance / 1000) * 100) / 100 : 0;
  const movingTimeSecs = apiActivity.moving_time || apiActivity.elapsed_time || 0;
  const mins = Math.floor(movingTimeSecs / 60);
  const secs = movingTimeSecs % 60;

  let pace = '--:--';
  if (distanceKm > 0 && movingTimeSecs > 0) {
    const secPerKm = movingTimeSecs / distanceKm;
    const pMins = Math.floor(secPerKm / 60);
    const pSecs = Math.floor(secPerKm % 60);
    pace = `${pMins}:${pSecs < 10 ? '0' : ''}${pSecs}`;
  }

  let workoutDate = new Date().toISOString().split('T')[0];
  if (apiActivity.start_date_local) {
    workoutDate = apiActivity.start_date_local.split('T')[0];
  } else if (apiActivity.start_date) {
    workoutDate = apiActivity.start_date.split('T')[0];
  }

  return {
    stravaId: String(apiActivity.id || ''),
    title: apiActivity.name || 'Strava Activity',
    date: workoutDate,
    distanceKm: distanceKm,
    durationMinutes: mins,
    durationSeconds: secs,
    pace: pace,
    elevationMeters: Math.round(apiActivity.total_elevation_gain || 0),
    avgHeartRate: apiActivity.average_heartrate ? Math.round(apiActivity.average_heartrate) : null,
    maxHeartRate: apiActivity.max_heartrate ? Math.round(apiActivity.max_heartrate) : null,
    calories: apiActivity.calories ? Math.round(apiActivity.calories) : Math.round(distanceKm * 68),
    routeType: apiActivity.sport_type || apiActivity.type || 'Road',
    notes: apiActivity.description || `Imported via Strava (ID: ${apiActivity.id})`
  };
}
