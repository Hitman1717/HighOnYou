import React from 'react';
import { useApp } from '../../context/AppContext';
import { Users, Dumbbell, Activity } from 'lucide-react';

export default function PartnerComparisonView() {
  const { profiles, activeProfileId, setActiveProfileId, gymLogs, stravaRuns } = useApp();

  const user1 = profiles[0];
  const user2 = profiles[1];

  const u1Gym = gymLogs[user1.id] || [];
  const u2Gym = gymLogs[user2.id] || [];

  const u1Runs = stravaRuns[user1.id] || [];
  const u2Runs = stravaRuns[user2.id] || [];

  const u1Km = u1Runs.reduce((acc, r) => acc + (parseFloat(r.distanceKm) || 0), 0);
  const u2Km = u2Runs.reduce((acc, r) => acc + (parseFloat(r.distanceKm) || 0), 0);

  const combined = [
    ...u1Gym.map((g) => ({ ...g, type: 'gym', user: user1 })),
    ...u2Gym.map((g) => ({ ...g, type: 'gym', user: user2 })),
    ...u1Runs.map((r) => ({ ...r, type: 'run', user: user1 })),
    ...u2Runs.map((r) => ({ ...r, type: 'run', user: user2 }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Both Athletes</h2>
          <p className="text-xs text-gray-500">Compare workouts and runs</p>
        </div>
      </div>

      {/* Side-by-Side Athlete Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* User 1 */}
        <div
          className={`bg-white border rounded-xl p-4 shadow-sm transition ${
            activeProfileId === user1.id ? 'border-gray-900 ring-1 ring-gray-900' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h3 className="font-bold text-sm text-gray-900">{user1.name}</h3>
            {activeProfileId === user1.id ? (
              <span className="text-[10px] bg-gray-900 text-white px-2 py-0.5 rounded font-semibold">
                Active
              </span>
            ) : (
              <button
                onClick={() => setActiveProfileId(user1.id)}
                className="text-xs text-blue-600 font-semibold"
              >
                Switch
              </button>
            )}
          </div>
          <div className="mt-3 space-y-1 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Exercises:</span>
              <strong className="text-gray-900">{u1Gym.length}</strong>
            </div>
            <div className="flex justify-between">
              <span>Running:</span>
              <strong className="text-orange-600">{u1Km.toFixed(1)} km</strong>
            </div>
          </div>
        </div>

        {/* User 2 */}
        <div
          className={`bg-white border rounded-xl p-4 shadow-sm transition ${
            activeProfileId === user2.id ? 'border-gray-900 ring-1 ring-gray-900' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h3 className="font-bold text-sm text-gray-900">{user2.name}</h3>
            {activeProfileId === user2.id ? (
              <span className="text-[10px] bg-gray-900 text-white px-2 py-0.5 rounded font-semibold">
                Active
              </span>
            ) : (
              <button
                onClick={() => setActiveProfileId(user2.id)}
                className="text-xs text-blue-600 font-semibold"
              >
                Switch
              </button>
            )}
          </div>
          <div className="mt-3 space-y-1 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Exercises:</span>
              <strong className="text-gray-900">{u2Gym.length}</strong>
            </div>
            <div className="flex justify-between">
              <span>Running:</span>
              <strong className="text-orange-600">{u2Km.toFixed(1)} km</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Unified Activity List */}
      <div className="space-y-2">
        <h3 className="font-bold text-sm text-gray-900">Combined Activity Feed</h3>
        {combined.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-xs text-gray-400">
            No activities logged yet.
          </div>
        ) : (
          <div className="space-y-1.5">
            {combined.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">{item.user.name}</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-500">{item.date}</span>
                </div>

                <div>
                  {item.type === 'gym' ? (
                    <span className="font-semibold text-gray-900 flex items-center gap-1">
                      <Dumbbell className="w-3.5 h-3.5 text-gray-600" />
                      {item.exerciseName || item.name}
                    </span>
                  ) : (
                    <span className="font-semibold text-orange-600 flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5" />
                      {item.title} ({item.distanceKm} km)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
