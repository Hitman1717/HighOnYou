import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Activity,
  Check,
  Zap,
  Clock,
  Heart,
  Mountain,
  Footprints,
  MapPin,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function LogRunModal({ onClose }) {
  const { addStravaRun, selectedDate } = useApp();

  const [title, setTitle] = useState('Morning Outdoor Run');
  const [date, setDate] = useState(selectedDate);
  const [distanceKm, setDistanceKm] = useState('5.00');
  const [durationMinutes, setDurationMinutes] = useState('26');
  const [durationSeconds, setDurationSeconds] = useState('30');
  const [elevationMeters, setElevationMeters] = useState('45');
  const [avgHeartRate, setAvgHeartRate] = useState('152');
  const [maxHeartRate, setMaxHeartRate] = useState('168');
  const [cadence, setCadence] = useState('166');
  const [routeType, setRouteType] = useState('Road');
  const [shoes, setShoes] = useState('Daily Running Shoes');
  const [notes, setNotes] = useState('');
  const [stravaUrl, setStravaUrl] = useState('');

  // Live Pace Calculation
  const dist = parseFloat(distanceKm) || 0;
  const mins = parseInt(durationMinutes) || 0;
  const secs = parseInt(durationSeconds) || 0;
  const totalSecs = mins * 60 + secs;

  let livePace = '--:--';
  if (dist > 0 && totalSecs > 0) {
    const secPerKm = totalSecs / dist;
    const paceMins = Math.floor(secPerKm / 60);
    const paceSecs = Math.floor(secPerKm % 60);
    livePace = `${paceMins}:${paceSecs < 10 ? '0' : ''}${paceSecs}`;
  }

  // Quick distance presets
  const applyPreset = (presetDist, presetMin, presetSec, presetTitle) => {
    setDistanceKm(presetDist.toString());
    setDurationMinutes(presetMin.toString());
    setDurationSeconds(presetSec.toString());
    setTitle(presetTitle);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (dist <= 0) {
      alert('Please enter a valid distance.');
      return;
    }

    addStravaRun({
      title: title.trim() || 'Outdoor Run',
      date,
      distanceKm: dist,
      durationMinutes: mins,
      durationSeconds: secs,
      elevationMeters: parseInt(elevationMeters) || 0,
      avgHeartRate: avgHeartRate ? parseInt(avgHeartRate) : null,
      maxHeartRate: maxHeartRate ? parseInt(maxHeartRate) : null,
      cadence: cadence ? parseInt(cadence) : null,
      routeType,
      shoes,
      notes: notes.trim(),
      stravaId: stravaUrl.trim() ? stravaUrl : `strava-run-${Date.now().toString().slice(-6)}`
    });

    confetti({
      particleCount: 80,
      spread: 60,
      colors: ['#FC4C02', '#FF8000', '#FFA500'],
      origin: { y: 0.6 }
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header with Strava Brand Accent */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/15 text-[#FC4C02] border border-orange-500/30">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-100 text-base sm:text-lg">
                  Log Strava Run
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-orange-500/20 text-[#FC4C02] border border-orange-500/30">
                  STRAVA STYLE
                </span>
              </div>
              <p className="text-xs text-slate-400">Record distance, calculated pace, elevation & heart rate</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* Quick Presets */}
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
              Quick Run Presets:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => applyPreset(5.0, 26, 30, '5K Pace Pusher')}
                className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-orange-500/20 hover:text-orange-400 border border-slate-700/60 transition"
              >
                5 km (26m)
              </button>
              <button
                type="button"
                onClick={() => applyPreset(7.5, 41, 15, 'Mid-Week 7.5K Tempo')}
                className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-orange-500/20 hover:text-orange-400 border border-slate-700/60 transition"
              >
                7.5 km (41m)
              </button>
              <button
                type="button"
                onClick={() => applyPreset(10.0, 54, 0, 'Weekend 10K Run')}
                className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-orange-500/20 hover:text-orange-400 border border-slate-700/60 transition"
              >
                10 km (54m)
              </button>
              <button
                type="button"
                onClick={() => applyPreset(21.1, 115, 0, 'Half-Marathon Long Run')}
                className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-orange-500/20 hover:text-orange-400 border border-slate-700/60 transition"
              >
                21.1 km Half
              </button>
            </div>
          </div>

          {/* Title & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Activity Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Morning 5k Tempo Run"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Core Metrics: Distance, Duration, Live Pace display */}
          <div className="bg-slate-950/80 border border-orange-500/20 rounded-2xl p-4 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-orange-400" />
              Primary Performance Stats
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Distance (km)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  required
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-base font-bold font-mono text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Duration (Mins)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-base font-bold font-mono text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Duration (Secs)
                </label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={durationSeconds}
                  onChange={(e) => setDurationSeconds(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-base font-bold font-mono text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Live Calculated Pace Banner */}
            <div className="flex items-center justify-between bg-orange-500/10 border border-orange-500/30 rounded-xl px-3.5 py-2">
              <span className="text-xs font-medium text-orange-300">
                Calculated Average Pace:
              </span>
              <div className="flex items-baseline gap-1 font-mono font-black text-orange-400 text-lg">
                <span>{livePace}</span>
                <span className="text-xs font-normal text-orange-300">/km</span>
              </div>
            </div>
          </div>

          {/* Secondary stats: Elevation, HR, Cadence */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
                <Mountain className="w-3 h-3 text-emerald-400" />
                Elevation (m)
              </label>
              <input
                type="number"
                min="0"
                value={elevationMeters}
                onChange={(e) => setElevationMeters(e.target.value)}
                placeholder="40"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
                <Heart className="w-3 h-3 text-rose-400" />
                Avg HR (bpm)
              </label>
              <input
                type="number"
                min="50"
                max="220"
                value={avgHeartRate}
                onChange={(e) => setAvgHeartRate(e.target.value)}
                placeholder="150"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
                <Footprints className="w-3 h-3 text-blue-400" />
                Cadence (spm)
              </label>
              <input
                type="number"
                min="100"
                max="220"
                value={cadence}
                onChange={(e) => setCadence(e.target.value)}
                placeholder="168"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>
          </div>

          {/* Route type & Gear */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Route Surface
              </label>
              <select
                value={routeType}
                onChange={(e) => setRouteType(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
              >
                <option value="Road">Road</option>
                <option value="Trail">Trail</option>
                <option value="Track">Track (400m)</option>
                <option value="Treadmill">Treadmill</option>
                <option value="Park">Park / Gravel</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Running Shoes
              </label>
              <input
                type="text"
                value={shoes}
                onChange={(e) => setShoes(e.target.value)}
                placeholder="e.g. Nike Pegasus"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Strava link / ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
              <ExternalLink className="w-3 h-3 text-[#FC4C02]" />
              Strava Activity URL or ID (Optional)
            </label>
            <input
              type="text"
              value={stravaUrl}
              onChange={(e) => setStravaUrl(e.target.value)}
              placeholder="e.g. https://www.strava.com/activities/12345678"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Run Notes & Weather
            </label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did the legs feel? Weather conditions, splits..."
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-orange-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#FC4C02] to-amber-600 hover:from-[#E03F00] hover:to-amber-700 shadow-lg shadow-orange-500/25 transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Save Strava Run
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

