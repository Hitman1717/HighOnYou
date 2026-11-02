import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import GymTrackerView from './components/GymTracker/GymTrackerView';
import StravaTrackerView from './components/StravaTracker/StravaTrackerView';
import DietTrackerView from './components/DietTracker/DietTrackerView';
import PartnerComparisonView from './components/TwoPlayerHub/PartnerComparisonView';

function MainLayout() {
  const [currentTab, setCurrentTab] = useState('gym');

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
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
        Simple 2-Person Fitness Tracker • Local browser storage
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
