import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Dumbbell, Activity, Utensils, Users, Calendar, Download, RefreshCw } from 'lucide-react';

export default function Header({ currentTab, setCurrentTab }) {
  const {
    profiles,
    activeProfileId,
    setActiveProfileId,
    activeProfile,
    selectedDate,
    setSelectedDate,
    exportAllData,
    resetToSampleData,
    cloudStatus
  } = useApp();

  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-3">
        {/* Top Row: Logo & Person Switcher */}
        <div className="flex items-center justify-between gap-3">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center font-bold text-sm">
              FIT
            </div>
            <div>
              <h1 className="font-bold text-base text-gray-900 tracking-tight leading-none">
                Fitness Tracker
              </h1>
              <p className="text-[11px] text-gray-500">2-Person Simple Logger</p>
            </div>
          </div>

          {/* 2-Person Toggle & Cloud Status */}
          <div className="flex items-center gap-2">
            {cloudStatus === 'synced' ? (
              <span
                className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200"
                title="Real-time Cloud Sync active via Firebase Firestore"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Cloud Synced
              </span>
            ) : (
              <span
                className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-lg border border-gray-200"
                title="Saving to local browser storage"
              >
                Local Mode
              </span>
            )}

            <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
              {profiles.map((p) => {
                const isActive = p.id === activeProfileId;
                return (
                  <button
                    key={p.id}
                    onClick={() => setActiveProfileId(p.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      isActive
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>

            {/* Quick backup / reset menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg border border-gray-200 text-xs"
                title="Options"
              >
                ⚙️
              </button>

              {showMenu && (
                <div
                  className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50 text-xs"
                  onClick={() => setShowMenu(false)}
                >
                  <button
                    onClick={exportAllData}
                    className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 text-gray-500" />
                    Export Backup (JSON)
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Clear all logs and start fresh?')) {
                        resetToSampleData();
                      }
                    }}
                    className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-rose-500" />
                    Clear All Logs (Fresh Start)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-100">
          <button
            onClick={() => setCurrentTab('gym')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              currentTab === 'gym'
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Gym</span>
          </button>

          <button
            onClick={() => setCurrentTab('strava')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              currentTab === 'strava'
                ? 'bg-orange-600 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Running</span>
          </button>

          <button
            onClick={() => setCurrentTab('diet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              currentTab === 'diet'
                ? 'bg-emerald-600 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Diet</span>
          </button>

          <button
            onClick={() => setCurrentTab('partner')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              currentTab === 'partner'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Both Athletes</span>
          </button>
        </div>
      </div>
    </header>
  );
}
