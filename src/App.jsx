import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import GymTrackerView from './components/GymTracker/GymTrackerView';
import StravaTrackerView from './components/StravaTracker/StravaTrackerView';
import DietTrackerView from './components/DietTracker/DietTrackerView';
import PartnerComparisonView from './components/TwoPlayerHub/PartnerComparisonView';

function MainLayout() {
  const [currentTab, setCurrentTab] = useState('gym');
  const { firestoreError } = useApp();
  const [dismissBanner, setDismissBanner] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Alert banner if Firestore is disabled in Firebase Console */}
      {firestoreError && !dismissBanner && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>
              <strong>Cross-Device Cloud Sync is offline:</strong> Cloud Firestore database has not been enabled yet in Firebase Project <code>highonyou</code>.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://console.firebase.google.com/project/highonyou/firestore"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-amber-800 underline hover:text-black whitespace-nowrap"
            >
              Enable Firestore in 1 Click &rarr;
            </a>
            <button
              onClick={() => setDismissBanner(true)}
              className="text-amber-600 hover:text-black font-bold px-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Clean White Header */}
      <Header currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
        {currentTab === 'gym' && <GymTrackerView />}
        {currentTab === 'strava' && <StravaTrackerView />}
        {currentTab === 'diet' && <DietTrackerView />}
        {currentTab === 'partner' && <PartnerComparisonView />}
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-gray-200 bg-white py-4 text-center text-xs text-gray-400">
        Simple 2-Person Fitness Tracker • Rohit & Vybhavi
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
