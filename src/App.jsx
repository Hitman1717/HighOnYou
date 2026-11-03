import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import GymTrackerView from './components/GymTracker/GymTrackerView';
import StravaTrackerView from './components/StravaTracker/StravaTrackerView';
import DietTrackerView from './components/DietTracker/DietTrackerView';
import PartnerComparisonView from './components/TwoPlayerHub/PartnerComparisonView';

function MainLayout() {
  const [currentTab, setCurrentTab] = useState('gym');
  const { cloudStatus, firestoreError, testCloudConnection } = useApp();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await testCloudConnection();
    setTesting(false);
    setTestResult(res);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Alert banner if Firestore is disabled or pending in Firebase Console */}
      {cloudStatus !== 'synced' && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-xs text-amber-950">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-start sm:items-center gap-2">
              <span className="text-base">⚠️</span>
              <div>
                <span className="font-bold text-amber-900">Firestore Cloud Table Not Activated:</span>{' '}
                Google rejected writes because Cloud Firestore is not enabled in Firebase project <code>highonyou</code> yet.
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                onClick={handleTestConnection}
                disabled={testing}
                className="px-2.5 py-1 bg-white border border-amber-300 rounded-md font-semibold text-amber-900 hover:bg-amber-100 transition"
              >
                {testing ? 'Testing...' : 'Test Connection'}
              </button>
              <a
                href="https://console.firebase.google.com/project/highonyou/firestore"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-md transition shadow-xs whitespace-nowrap"
              >
                Create Database &rarr;
              </a>
            </div>
          </div>
          {testResult && (
            <div className="max-w-4xl mx-auto mt-2 pt-2 border-t border-amber-200 text-[11px]">
              {testResult.success ? (
                <span className="text-emerald-700 font-bold">
                  ✅ Success! Connected to Firestore. Data is now saving to your cloud table.
                </span>
              ) : (
                <span className="text-rose-700 font-medium">
                  ❌ Google Cloud Error: {testResult.error}
                </span>
              )}
            </div>
          )}
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
