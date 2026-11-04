import React, { useState } from 'react';
import {
  Share2,
  Sparkles,
  Check,
  AlertCircle,
  Key,
  ChevronDown,
  ChevronUp,
  X,
  ExternalLink,
  Flame,
  Activity,
  Clock,
  Gauge
} from 'lucide-react';
import {
  processStravaWorkout,
  getStoredStravaToken,
  setStoredStravaToken
} from '../../utils/stravaApi';

export default function StravaShareCard({ onSaveRun, selectedDate }) {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [showTokenSettings, setShowTokenSettings] = useState(false);
  const [tokenInput, setTokenInput] = useState(getStoredStravaToken());
  const [tokenSavedFeedback, setTokenSavedFeedback] = useState(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState('');

  // Handle Token Save
  const handleSaveToken = (e) => {
    e.preventDefault();
    setStoredStravaToken(tokenInput);
    setTokenSavedFeedback(true);
    setTimeout(() => setTokenSavedFeedback(false), 2500);
  };

  // Handle Extract
  const handleExtract = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSavedSuccessMsg('');

    if (!inputText.trim()) {
      setErrorMsg('Please paste a Strava share link or workout text.');
      return;
    }

    setIsProcessing(true);
    try {
      const data = await processStravaWorkout(inputText, {
        fallbackDate: selectedDate
      });

      if (!data.distanceKm && !data.activityId && (!data.durationMinutes && !data.durationSeconds)) {
        setErrorMsg('Could not detect workout details. Please verify the link or text.');
        setIsProcessing(false);
        return;
      }

      setExtractedData({
        title: data.title || 'Strava Run',
        date: data.date || selectedDate,
        distanceKm: data.distanceKm || 0,
        durationMinutes: data.durationMinutes || 0,
        durationSeconds: data.durationSeconds || 0,
        pace: data.pace || '--:--',
        elevationMeters: data.elevationMeters || 0,
        avgHeartRate: data.avgHeartRate || '',
        maxHeartRate: data.maxHeartRate || '',
        calories: data.calories || 0,
        routeType: data.routeType || 'Road',
        stravaId: data.activityId || '',
        source: data.source || 'Strava Share',
        apiWarning: data.apiWarning || null
      });
    } catch (err) {
      setErrorMsg(err.message || 'Failed to extract Strava workout.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Save Extracted Run
  const handleConfirmSave = () => {
    if (!extractedData) return;

    if (!extractedData.distanceKm || extractedData.distanceKm <= 0) {
      alert('Please ensure distance is greater than 0.');
      return;
    }

    onSaveRun({
      title: extractedData.title,
      date: extractedData.date,
      distanceKm: parseFloat(extractedData.distanceKm) || 0,
      durationMinutes: parseInt(extractedData.durationMinutes) || 0,
      durationSeconds: parseInt(extractedData.durationSeconds) || 0,
      pace: extractedData.pace,
      elevationMeters: parseInt(extractedData.elevationMeters) || 0,
      avgHeartRate: extractedData.avgHeartRate ? parseInt(extractedData.avgHeartRate) : null,
      maxHeartRate: extractedData.maxHeartRate ? parseInt(extractedData.maxHeartRate) : null,
      calories: parseInt(extractedData.calories) || Math.round(extractedData.distanceKm * 68),
      routeType: extractedData.routeType || 'Road',
      stravaId: extractedData.stravaId || `strava_${Date.now()}`
    });

    setSavedSuccessMsg(`Saved "${extractedData.title}" (${extractedData.distanceKm} km)!`);
    setExtractedData(null);
    setInputText('');
    setTimeout(() => setSavedSuccessMsg(''), 3000);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 font-black text-sm">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
              Strava Share & Auto-Extract
              <span className="text-[10px] bg-orange-100 text-orange-800 font-semibold px-1.5 py-0.5 rounded-full">
                Instant
              </span>
            </h3>
            <p className="text-xs text-gray-500">
              Share your workout link or text from Strava to extract stats
            </p>
          </div>
        </div>

        {/* API Settings Toggle */}
        <button
          type="button"
          onClick={() => setShowTokenSettings(!showTokenSettings)}
          className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1 border border-gray-200 rounded-lg px-2.5 py-1 bg-gray-50 hover:bg-gray-100 transition"
        >
          <Key className="w-3.5 h-3.5 text-orange-600" />
          <span className="hidden sm:inline">Strava API Key</span>
          {showTokenSettings ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Optional Strava Token Box */}
      {showTokenSettings && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-800 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-orange-600" />
              Strava API Access Token (Optional)
            </span>
            <a
              href="https://www.strava.com/settings/api"
              target="_blank"
              rel="noreferrer"
              className="text-orange-600 hover:underline flex items-center gap-1 text-[11px]"
            >
              Get Free Token <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <p className="text-gray-500 text-[11px]">
            If provided, the app will query Strava API v3 for exact distance, elevation, and heart rate metrics when activity links are shared.
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Paste Strava access token (e.g. 7a8b9c...)"
              className="flex-1 bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-gray-900 font-mono"
            />
            <button
              onClick={handleSaveToken}
              className="bg-gray-900 text-white px-3 py-1.5 rounded font-medium hover:bg-black transition text-xs"
            >
              Save Token
            </button>
          </div>
          {tokenSavedFeedback && (
            <div className="text-emerald-600 font-medium text-[11px] flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Token saved in local storage!
            </div>
          )}
        </div>
      )}

      {/* Feedback Messages */}
      {savedSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 font-medium">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{savedSuccessMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 font-medium">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Share Input Area */}
      {!extractedData ? (
        <form onSubmit={handleExtract} className="space-y-3">
          <div>
            <textarea
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Paste your Strava share link or message here...\nExamples: "https://www.strava.com/activities/..." or "Morning Run - 5.24 km, 28:15 (5:23 /km) https://strava.app.link/..."`}
              className="w-full bg-white border border-gray-300 rounded-lg p-3 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-orange-600 transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs tracking-wide transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {isProcessing ? 'Extracting Workout...' : 'Extract Workout Data'}
            </button>

            {inputText && (
              <button
                type="button"
                onClick={() => setInputText('')}
                className="px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 text-xs font-medium transition"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      ) : (
        /* EXTRACTED PREVIEW CARD */
        <div className="bg-orange-50/60 border border-orange-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-orange-200/80 pb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span className="font-bold text-xs text-orange-900">
                Extracted Workout Preview
              </span>
              <span className="text-[10px] bg-white border border-orange-200 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                {extractedData.source}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setExtractedData(null)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Editable Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                Workout Title
              </label>
              <input
                type="text"
                value={extractedData.title}
                onChange={(e) =>
                  setExtractedData({ ...extractedData, title: e.target.value })
                }
                className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 font-medium focus:outline-none focus:border-orange-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={extractedData.date}
                onChange={(e) =>
                  setExtractedData({ ...extractedData, date: e.target.value })
                }
                className="w-full bg-white border border-gray-300 rounded-lg px-2 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-orange-600"
              />
            </div>
          </div>

          {/* Extracted Metrics Badges */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-center">
            <div className="bg-white border border-orange-200 rounded-lg p-2">
              <span className="block text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                Distance
              </span>
              <span className="text-sm font-extrabold text-gray-900">
                {extractedData.distanceKm}
                <span className="text-[11px] font-medium text-gray-500 ml-0.5">km</span>
              </span>
            </div>

            <div className="bg-white border border-orange-200 rounded-lg p-2">
              <span className="block text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                Duration
              </span>
              <span className="text-sm font-extrabold text-gray-900">
                {extractedData.durationMinutes}m {extractedData.durationSeconds || 0}s
              </span>
            </div>

            <div className="bg-white border border-orange-200 rounded-lg p-2">
              <span className="block text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                Pace
              </span>
              <span className="text-sm font-extrabold text-orange-600">
                {extractedData.pace}
                <span className="text-[11px] font-medium text-gray-500 ml-0.5">/km</span>
              </span>
            </div>

            <div className="bg-white border border-orange-200 rounded-lg p-2 col-span-3 sm:col-span-1">
              <span className="block text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                Calories
              </span>
              <span className="text-sm font-extrabold text-gray-900 flex items-center justify-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-500 inline" />
                {extractedData.calories || Math.round(extractedData.distanceKm * 68)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleConfirmSave}
              className="flex-1 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs tracking-wide transition shadow-sm flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Save to Today's Runs
            </button>

            <button
              type="button"
              onClick={() => setExtractedData(null)}
              className="px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
