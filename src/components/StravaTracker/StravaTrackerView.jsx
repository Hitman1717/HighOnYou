import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Activity, Plus, Trash2, Calendar, Clock, ThumbsUp } from 'lucide-react';

export default function StravaTrackerView() {
  const {
    activeProfile,
    selectedDate,
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

  const runs = getActiveUserRuns();

  // Auto calculate pace
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
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {activeProfile.name}'s Running Tracker
          </h2>
          <p className="text-xs text-gray-500">Track distance, time & pace</p>
        </div>
      </div>

      {/* WHITE CARD: LOG RUN */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
          <Activity className="w-4 h-4 text-orange-600" />
          Log a Run
        </h3>

        <form onSubmit={handleSaveRun} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
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
            className="w-full py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs tracking-wide transition shadow-sm"
          >
            Save Run
          </button>
        </form>
      </div>

      {/* RUN HISTORY */}
      <div className="space-y-2">
        <h3 className="font-bold text-sm text-gray-900">Past Runs ({runs.length})</h3>

        {runs.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-xs text-gray-400">
            No runs logged yet.
          </div>
        ) : (
          <div className="space-y-2">
            {runs.map((r) => (
              <div
                key={r.id}
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:border-gray-300 transition flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-gray-900">{r.title}</h4>
                    <span className="text-[11px] text-gray-400">{r.date}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                    <span>
                      <strong className="text-gray-900">{r.distanceKm}</strong> km
                    </span>
                    <span>•</span>
                    <span>
                      <strong className="text-orange-600">{r.pace}</strong> /km
                    </span>
                    <span>•</span>
                    <span>
                      {r.durationMinutes}m {r.durationSeconds ? `${r.durationSeconds}s` : ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
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
                      if (confirm(`Delete run?`)) deleteStravaRun(r.id);
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
