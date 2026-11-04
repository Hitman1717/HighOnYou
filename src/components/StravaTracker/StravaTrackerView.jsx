import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Activity, Plus, Trash2, Calendar, Clock, ThumbsUp, ChevronDown, ChevronUp, MapPin, Flame } from 'lucide-react';
import StravaShareCard from './StravaShareCard';

export default function StravaTrackerView() {
  const {
    activeProfile,
    selectedDate,
    setSelectedDate,
    getActiveUserRuns,
    addStravaRun,
    deleteStravaRun,
    giveKudos
  } = useApp();

  const [title, setTitle] = useState('Morning Run');
  const [date, setDate] = useState(selectedDate);
  const [distanceKm, setDistanceKm] = useState('5.0');
  const [minutes, setMinutes] = useState('25');
  const [seconds, setSeconds] = useState('0');
  const [showManualForm, setShowManualForm] = useState(false);
  const [viewScope, setViewScope] = useState('day'); // 'day' (default) or 'all'

  const allRuns = getActiveUserRuns();

  // Filter runs by selected date for the day view
  const currentTargetDate = selectedDate;
  const dayRuns = allRuns.filter((r) => r.date === currentTargetDate);
  const displayRuns = viewScope === 'day' ? dayRuns : allRuns;

  // Auto calculate pace for manual form
  const dist = parseFloat(distanceKm) || 0;
  const mins = parseInt(minutes) || 0;
  const secs = parseInt(seconds) || 0;
  const totalSecs = mins * 60 + secs;

  let pace = '--:--';
  if (dist > 0 && totalSecs > 0) {
    const secPerKm = totalSecs / dist;
    const pMins = Math.floor(secPerKm / 60);
    const pSecs = Math.floor(secPerKm % 60);
    pace = `${pMins}:${pSecs < 10 ? '0' : ''}${pSecs}`;
  }

  const handleSaveRun = (e) => {
    e.preventDefault();
    if (dist <= 0) {
      alert('Please enter a valid distance.');
      return;
    }

    addStravaRun({
      title: title.trim() || 'Outdoor Run',
      date: date || selectedDate,
      distanceKm: dist,
      durationMinutes: mins,
      durationSeconds: secs,
      elevationMeters: 0,
      routeType: 'Road'
    });

    setTitle('Run');
    setShowManualForm(false);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {activeProfile.name}'s Running Tracker
          </h2>
          <p className="text-xs text-gray-500">Track distance, time, pace & Strava shares</p>
        </div>

        {/* Global Date Selector */}
        <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-xs shadow-sm">
          <Calendar className="w-3.5 h-3.5 text-gray-500" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setDate(e.target.value);
            }}
            className="bg-transparent text-gray-700 text-xs focus:outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* 1. STRAVA WORKOUT SHARE & AUTO-EXTRACT CARD */}
      <StravaShareCard onSaveRun={addStravaRun} selectedDate={selectedDate} />

      {/* 2. OPTIONAL MANUAL LOG COLLAPSIBLE */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm transition">
        <button
          type="button"
          onClick={() => setShowManualForm(!showManualForm)}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 text-left transition"
        >
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-gray-700" />
            <span className="font-bold text-xs text-gray-900">
              Log Run Manually (Distance & Time)
            </span>
          </div>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            {showManualForm ? 'Hide Form' : 'Show Form'}
            {showManualForm ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </span>
        </button>

        {showManualForm && (
          <form onSubmit={handleSaveRun} className="p-4 pt-0 space-y-3 border-t border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Run Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Morning 5k Tempo"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-2 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-gray-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Distance (km)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  required
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-center text-sm font-bold text-gray-900 focus:outline-none focus:border-gray-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Minutes
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-center text-sm font-bold text-gray-900 focus:outline-none focus:border-gray-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Seconds
                </label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={seconds}
                  onChange={(e) => setSeconds(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-center text-sm font-bold text-gray-900 focus:outline-none focus:border-gray-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-xs">
              <span className="text-orange-900 font-medium">Calculated Pace:</span>
              <span className="font-bold text-orange-600 text-sm">{pace} /km</span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-gray-900 hover:bg-black text-white font-semibold text-xs tracking-wide transition shadow-sm"
            >
              Save Run
            </button>
          </form>
        )}
      </div>

      {/* 3. RUN HISTORY - STRICTLY SHOWS SELECTED DAY BY DEFAULT */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <span>
                {viewScope === 'day'
                  ? `Activities for ${currentTargetDate}`
                  : 'All Run Activities'}
              </span>
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                {displayRuns.length}
              </span>
            </h3>
          </div>

          {/* Scope Toggle: Default to 'day' */}
          <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-xs">
            <button
              type="button"
              onClick={() => setViewScope('day')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                viewScope === 'day'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              This Day ({dayRuns.length})
            </button>
            <button
              type="button"
              onClick={() => setViewScope('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                viewScope === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Dates ({allRuns.length})
            </button>
          </div>
        </div>

        {displayRuns.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-xs text-gray-400 space-y-1">
            <p className="font-medium text-gray-600">
              {viewScope === 'day'
                ? `No runs recorded for ${currentTargetDate}.`
                : 'No runs recorded yet.'}
            </p>
            <p className="text-[11px] text-gray-400">
              Paste a workout share link above or log a run to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayRuns.map((r) => (
              <div
                key={r.id}
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:border-gray-300 transition flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-gray-900">{r.title}</h4>
                    <span className="text-[11px] text-gray-400 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded">
                      {r.date}
                    </span>
                    {r.routeType && (
                      <span className="text-[10px] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded font-medium">
                        {r.routeType}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600 mt-1.5">
                    <span>
                      <strong className="text-gray-900 font-semibold">{r.distanceKm}</strong> km
                    </span>
                    <span>•</span>
                    <span>
                      <strong className="text-orange-600 font-semibold">{r.pace}</strong> /km
                    </span>
                    <span>•</span>
                    <span>
                      {r.durationMinutes}m {r.durationSeconds ? `${r.durationSeconds}s` : ''}
                    </span>
                    {r.elevationMeters ? (
                      <>
                        <span>•</span>
                        <span>{r.elevationMeters}m elev</span>
                      </>
                    ) : null}
                    {r.calories ? (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <Flame className="w-3 h-3 text-orange-500" />
                          {r.calories} kcal
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => giveKudos(r.id)}
                    className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border transition ${
                      r.hasGivenKudos
                        ? 'bg-orange-600 text-white border-orange-600'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>{r.kudos || 0}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Delete run "${r.title}"?`)) deleteStravaRun(r.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-500 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
