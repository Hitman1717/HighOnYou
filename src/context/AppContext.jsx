import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  INITIAL_PROFILES,
  INITIAL_GYM_LOGS,
  INITIAL_STRAVA_RUNS,
  INITIAL_DIET_LOGS
} from '../data/initialData';
import { db } from '../firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

const AppContext = createContext();

const STORAGE_KEYS = {
  PROFILES: 'apextrack_profiles_v3',
  ACTIVE_USER: 'apextrack_active_user_v3',
  GYM_LOGS: 'apextrack_gym_logs_v3',
  STRAVA_RUNS: 'apextrack_strava_runs_v3',
  DIET_LOGS: 'apextrack_diet_logs_v3'
};

// Clean up legacy keys
try {
  ['apextrack_gym_logs_v1', 'apextrack_strava_runs_v1', 'apextrack_diet_logs_v1'].forEach((k) => {
    localStorage.removeItem(k);
  });
} catch (e) {}

export const AppProvider = ({ children }) => {
  // Profiles
  const [profiles, setProfiles] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILES);
    if (!saved) return INITIAL_PROFILES;
    try {
      const parsed = JSON.parse(saved);
      return parsed.map((p) =>
        p.id === 'user_2' && (p.name === 'Partner' || !p.name)
          ? { ...p, name: 'Vybhavi' }
          : p
      );
    } catch {
      return INITIAL_PROFILES;
    }
  });

  const [activeProfileId, setActiveProfileId] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
    return saved || 'user_1';
  });

  // Active date for logging (defaults to today)
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Gym Logs { user_1: [...], user_2: [...] }
  const [gymLogs, setGymLogs] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GYM_LOGS);
    return saved ? JSON.parse(saved) : INITIAL_GYM_LOGS;
  });

  // Strava Runs { user_1: [...], user_2: [...] }
  const [stravaRuns, setStravaRuns] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STRAVA_RUNS);
    return saved ? JSON.parse(saved) : INITIAL_STRAVA_RUNS;
  });

  // Diet Logs { user_1: { '2026-11-01': { meals: [...], waterGlasses: 6 } } }
  const [dietLogs, setDietLogs] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DIET_LOGS);
    return saved ? JSON.parse(saved) : INITIAL_DIET_LOGS;
  });

  // Cloud Sync Status: 'synced' | 'connecting' | 'local'
  const [cloudStatus, setCloudStatus] = useState('connecting');
  const isSyncingRef = useRef(false);

  // Real-time Firestore Synchronization
  useEffect(() => {
    if (!db) {
      setCloudStatus('local');
      return;
    }

    try {
      const docRef = doc(db, 'fitness_tracker', 'duo_data');
      const unsubscribe = onSnapshot(
        docRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            // Only update if not currently pushing local changes
            if (!isSyncingRef.current) {
              if (data.profiles && Array.isArray(data.profiles)) setProfiles(data.profiles);
              if (data.gymLogs) setGymLogs(data.gymLogs);
              if (data.stravaRuns) setStravaRuns(data.stravaRuns);
              if (data.dietLogs) setDietLogs(data.dietLogs);
            }
            setCloudStatus('synced');
          } else {
            // First time initialization in Firestore
            setDoc(docRef, {
              profiles,
              gymLogs,
              stravaRuns,
              dietLogs,
              lastUpdated: new Date().toISOString()
            }, { merge: true })
              .then(() => setCloudStatus('synced'))
              .catch(() => setCloudStatus('local'));
          }
        },
        (error) => {
          console.debug('Firestore live sync error (falling back to local storage):', error.message);
          setCloudStatus('local');
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.debug('Firestore setup exception:', err);
      setCloudStatus('local');
    }
  }, []);

  // Helper to push updates to Firestore
  const pushToFirestore = async (updates) => {
    if (!db) return;
    try {
      isSyncingRef.current = true;
      const docRef = doc(db, 'fitness_tracker', 'duo_data');
      await setDoc(docRef, { ...updates, lastUpdated: new Date().toISOString() }, { merge: true });
      setCloudStatus('synced');
    } catch (e) {
      console.debug('Firestore write failed (data safe in localStorage):', e);
      setCloudStatus('local');
    } finally {
      setTimeout(() => {
        isSyncingRef.current = false;
      }, 500);
    }
  };

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, activeProfileId);
  }, [activeProfileId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GYM_LOGS, JSON.stringify(gymLogs));
  }, [gymLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STRAVA_RUNS, JSON.stringify(stravaRuns));
  }, [stravaRuns]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DIET_LOGS, JSON.stringify(dietLogs));
  }, [dietLogs]);

  // Current active profile helper
  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];
  const partnerProfile = profiles.find((p) => p.id !== activeProfileId) || profiles[1];

  // Profile functions
  const updateProfile = (id, updates) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  // GYM EXERCISE ACTIONS - Dead simple: Exercise name, sets, weights, reps
  const getActiveUserGymLogs = () => {
    const raw = gymLogs[activeProfileId] || [];
    const normalized = [];

    raw.forEach((item) => {
      // If legacy nested workout with exercises array
      if (item.exercises && Array.isArray(item.exercises)) {
        item.exercises.forEach((ex, exIdx) => {
          normalized.push({
            id: ex.id || `${item.id}_${exIdx}`,
            date: item.date,
            exerciseName: ex.name || 'Exercise',
            sets: (ex.sets || []).map((s, sIdx) => ({
              setNumber: s.setNumber || sIdx + 1,
              weight: parseFloat(s.weight) || 0,
              reps: parseInt(s.reps) || 0
            }))
          });
        });
      } else {
        // Direct exercise log
        normalized.push({
          id: item.id,
          date: item.date,
          exerciseName: item.exerciseName || item.name || 'Exercise',
          sets: (item.sets || []).map((s, sIdx) => ({
            setNumber: s.setNumber || sIdx + 1,
            weight: parseFloat(s.weight) || 0,
            reps: parseInt(s.reps) || 0
          }))
        });
      }
    });

    return normalized;
  };

  const addExercise = ({ exerciseName, sets, date }) => {
    const cleanSets = (sets || []).map((s, idx) => ({
      setNumber: idx + 1,
      weight: parseFloat(s.weight) || 0,
      reps: parseInt(s.reps) || 0
    }));

    const newExercise = {
      id: `ex_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      date: date || selectedDate,
      exerciseName: exerciseName.trim(),
      sets: cleanSets
    };

    setGymLogs((prev) => {
      const updated = {
        ...prev,
        [activeProfileId]: [newExercise, ...(prev[activeProfileId] || [])]
      };
      pushToFirestore({ gymLogs: updated });
      return updated;
    });
    return newExercise;
  };

  const updateExercise = (exerciseId, { exerciseName, sets, date }) => {
    const cleanSets = (sets || []).map((s, idx) => ({
      setNumber: idx + 1,
      weight: parseFloat(s.weight) || 0,
      reps: parseInt(s.reps) || 0
    }));

    setGymLogs((prev) => {
      const currentList = prev[activeProfileId] || [];
      const updated = currentList.map((item) => {
        if (item.id === exerciseId) {
          return {
            ...item,
            date: date || item.date,
            exerciseName: exerciseName.trim(),
            sets: cleanSets
          };
        }
        if (item.exercises && Array.isArray(item.exercises)) {
          const updatedExs = item.exercises.map((ex) => {
            if (ex.id === exerciseId) {
              return {
                ...ex,
                name: exerciseName.trim(),
                sets: cleanSets
              };
            }
            return ex;
          });
          return { ...item, exercises: updatedExs };
        }
        return item;
      });

      const nextState = {
        ...prev,
        [activeProfileId]: updated
      };
      pushToFirestore({ gymLogs: nextState });
      return nextState;
    });
  };

  const deleteExercise = (exerciseId) => {
    setGymLogs((prev) => {
      const currentList = prev[activeProfileId] || [];
      const updated = [];

      currentList.forEach((item) => {
        if (item.id === exerciseId) {
          return; // removed direct item
        }
        if (item.exercises && Array.isArray(item.exercises)) {
          const remaining = item.exercises.filter((ex) => ex.id !== exerciseId);
          if (remaining.length > 0) {
            updated.push({ ...item, exercises: remaining });
          }
        } else {
          updated.push(item);
        }
      });

      const nextState = {
        ...prev,
        [activeProfileId]: updated
      };
      pushToFirestore({ gymLogs: nextState });
      return nextState;
    });
  };

  // Backwards compatibility alias
  const addGymLog = addExercise;
  const deleteGymLog = deleteExercise;

  // Compute Personal Records (PR) for active user or specified user
  const getPersonalRecords = (targetUserId = activeProfileId) => {
    const logs = gymLogs[targetUserId] || [];
    const prMap = {};

    const processEx = (name, sets, date) => {
      sets?.forEach((s) => {
        const weight = parseFloat(s.weight) || 0;
        const reps = parseInt(s.reps) || 0;
        if (weight > 0) {
          if (!prMap[name] || weight > prMap[name].maxWeight) {
            prMap[name] = {
              exerciseName: name,
              maxWeight: weight,
              reps: reps,
              date: date
            };
          }
        }
      });
    };

    logs.forEach((item) => {
      if (item.exercises && Array.isArray(item.exercises)) {
        item.exercises.forEach((ex) => processEx(ex.name, ex.sets, item.date));
      } else {
        processEx(item.exerciseName || item.name, item.sets, item.date);
      }
    });

    return prMap;
  };

  // STRAVA RUN ACTIONS
  const getActiveUserRuns = () => stravaRuns[activeProfileId] || [];

  const addStravaRun = (runData) => {
    const distance = parseFloat(runData.distanceKm) || 0;
    const mins = parseInt(runData.durationMinutes) || 0;
    const secs = parseInt(runData.durationSeconds) || 0;
    const totalSeconds = mins * 60 + secs;

    // Calculate pace (min/km)
    let paceStr = '--:--';
    if (distance > 0 && totalSeconds > 0) {
      const secPerKm = totalSeconds / distance;
      const paceMins = Math.floor(secPerKm / 60);
      const paceSecs = Math.floor(secPerKm % 60);
      paceStr = `${paceMins}:${paceSecs < 10 ? '0' : ''}${paceSecs}`;
    }

    // Estimate calories if not provided (~60-75 kcal per km)
    const calories = runData.calories
      ? parseInt(runData.calories)
      : Math.round(distance * 68);

    const newRun = {
      id: `strava_${Date.now()}`,
      date: runData.date || selectedDate,
      title: runData.title || 'Outdoor Run',
      distanceKm: distance,
      durationMinutes: mins,
      durationSeconds: secs,
      elevationMeters: parseInt(runData.elevationMeters) || 0,
      avgHeartRate: runData.avgHeartRate ? parseInt(runData.avgHeartRate) : null,
      maxHeartRate: runData.maxHeartRate ? parseInt(runData.maxHeartRate) : null,
      pace: paceStr,
      cadence: runData.cadence ? parseInt(runData.cadence) : null,
      calories: calories,
      kudos: 1,
      hasGivenKudos: false,
      stravaId: runData.stravaId || `manual-${Date.now().toString().slice(-6)}`,
      routeType: runData.routeType || 'Road',
      shoes: runData.shoes || 'Running Shoes',
      notes: runData.notes || ''
    };

    setStravaRuns((prev) => {
      const updated = {
        ...prev,
        [activeProfileId]: [newRun, ...(prev[activeProfileId] || [])]
      };
      pushToFirestore({ stravaRuns: updated });
      return updated;
    });
    return newRun;
  };

  const deleteStravaRun = (runId) => {
    setStravaRuns((prev) => {
      const updated = {
        ...prev,
        [activeProfileId]: (prev[activeProfileId] || []).filter((r) => r.id !== runId)
      };
      pushToFirestore({ stravaRuns: updated });
      return updated;
    });
  };

  const giveKudos = (runId, targetUserId = activeProfileId) => {
    setStravaRuns((prev) => {
      const updated = {
        ...prev,
        [targetUserId]: (prev[targetUserId] || []).map((r) => {
          if (r.id === runId) {
            const currentlyLiked = r.hasGivenKudos;
            return {
              ...r,
              kudos: currentlyLiked ? r.kudos - 1 : r.kudos + 1,
              hasGivenKudos: !currentlyLiked
            };
          }
          return r;
        })
      };
      pushToFirestore({ stravaRuns: updated });
      return updated;
    });
  };

  // DIET LOG ACTIONS
  const getActiveUserDayDiet = (date = selectedDate) => {
    const userDiets = dietLogs[activeProfileId] || {};
    return (
      userDiets[date] || {
        waterGlasses: 0,
        meals: [
          { id: 'm_breakfast', name: 'Breakfast', items: [] },
          { id: 'm_lunch', name: 'Lunch', items: [] },
          { id: 'm_dinner', name: 'Dinner', items: [] },
          { id: 'm_snacks', name: 'Snacks & Pre-Workout', items: [] }
        ]
      }
    );
  };

  const addFoodItem = (mealName, foodItem, date = selectedDate) => {
    setDietLogs((prev) => {
      const userDiets = { ...(prev[activeProfileId] || {}) };
      const currentDay = userDiets[date] || {
        waterGlasses: 0,
        meals: [
          { id: 'm_breakfast', name: 'Breakfast', items: [] },
          { id: 'm_lunch', name: 'Lunch', items: [] },
          { id: 'm_dinner', name: 'Dinner', items: [] },
          { id: 'm_snacks', name: 'Snacks & Pre-Workout', items: [] }
        ]
      };

      const updatedMeals = currentDay.meals.map((meal) => {
        if (meal.name.toLowerCase() === mealName.toLowerCase()) {
          return {
            ...meal,
            items: [
              ...meal.items,
              {
                id: `food_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                name: foodItem.name,
                calories: Number(foodItem.calories) || 0,
                protein: Number(foodItem.protein) || 0,
                carbs: Number(foodItem.carbs) || 0,
                fat: Number(foodItem.fat) || 0,
                serving: foodItem.serving || '1 serving'
              }
            ]
          };
        }
        return meal;
      });

      const nextState = {
        ...prev,
        [activeProfileId]: {
          ...userDiets,
          [date]: {
            ...currentDay,
            meals: updatedMeals
          }
        }
      };
      pushToFirestore({ dietLogs: nextState });
      return nextState;
    });
  };

  const deleteFoodItem = (mealId, itemId, date = selectedDate) => {
    setDietLogs((prev) => {
      const userDiets = { ...(prev[activeProfileId] || {}) };
      const currentDay = userDiets[date];
      if (!currentDay) return prev;

      const updatedMeals = currentDay.meals.map((meal) => {
        if (meal.id === mealId) {
          return {
            ...meal,
            items: meal.items.filter((item) => item.id !== itemId)
          };
        }
        return meal;
      });

      const nextState = {
        ...prev,
        [activeProfileId]: {
          ...userDiets,
          [date]: {
            ...currentDay,
            meals: updatedMeals
          }
        }
      };
      pushToFirestore({ dietLogs: nextState });
      return nextState;
    });
  };

  const updateWaterGlasses = (delta, date = selectedDate) => {
    setDietLogs((prev) => {
      const userDiets = { ...(prev[activeProfileId] || {}) };
      const currentDay = userDiets[date] || {
        waterGlasses: 0,
        meals: [
          { id: 'm_breakfast', name: 'Breakfast', items: [] },
          { id: 'm_lunch', name: 'Lunch', items: [] },
          { id: 'm_dinner', name: 'Dinner', items: [] },
          { id: 'm_snacks', name: 'Snacks & Pre-Workout', items: [] }
        ]
      };

      const newCount = Math.max(0, (currentDay.waterGlasses || 0) + delta);

      const nextState = {
        ...prev,
        [activeProfileId]: {
          ...userDiets,
          [date]: {
            ...currentDay,
            waterGlasses: newCount
          }
        }
      };
      pushToFirestore({ dietLogs: nextState });
      return nextState;
    });
  };

  // Export / Import / Reset features
  const exportAllData = () => {
    const data = {
      exportDate: new Date().toISOString(),
      profiles,
      gymLogs,
      stravaRuns,
      dietLogs
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `apextrack_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importData = (imported) => {
    if (imported.profiles) setProfiles(imported.profiles);
    if (imported.gymLogs) setGymLogs(imported.gymLogs);
    if (imported.stravaRuns) setStravaRuns(imported.stravaRuns);
    if (imported.dietLogs) setDietLogs(imported.dietLogs);
    pushToFirestore({
      profiles: imported.profiles || profiles,
      gymLogs: imported.gymLogs || gymLogs,
      stravaRuns: imported.stravaRuns || stravaRuns,
      dietLogs: imported.dietLogs || dietLogs
    });
  };

  const clearAllData = () => {
    setGymLogs({ user_1: [], user_2: [] });
    setStravaRuns({ user_1: [], user_2: [] });
    setDietLogs({ user_1: {}, user_2: {} });
    try {
      localStorage.setItem(STORAGE_KEYS.GYM_LOGS, JSON.stringify({ user_1: [], user_2: [] }));
      localStorage.setItem(STORAGE_KEYS.STRAVA_RUNS, JSON.stringify({ user_1: [], user_2: [] }));
      localStorage.setItem(STORAGE_KEYS.DIET_LOGS, JSON.stringify({ user_1: {}, user_2: {} }));
    } catch (e) {}
    pushToFirestore({
      gymLogs: { user_1: [], user_2: [] },
      stravaRuns: { user_1: [], user_2: [] },
      dietLogs: { user_1: {}, user_2: {} }
    });
  };

  const resetToSampleData = clearAllData;

  return (
    <AppContext.Provider
      value={{
        profiles,
        activeProfileId,
        setActiveProfileId,
        activeProfile,
        partnerProfile,
        updateProfile,
        selectedDate,
        setSelectedDate,
        // Gym
        gymLogs,
        getActiveUserGymLogs,
        addExercise,
        updateExercise,
        deleteExercise,
        addGymLog,
        updateGymLog: updateExercise,
        deleteGymLog: deleteExercise,
        getPersonalRecords,
        // Strava
        stravaRuns,
        getActiveUserRuns,
        addStravaRun,
        deleteStravaRun,
        giveKudos,
        // Diet
        dietLogs,
        getActiveUserDayDiet,
        addFoodItem,
        deleteFoodItem,
        updateWaterGlasses,
        // Backup
        exportAllData,
        importData,
        resetToSampleData,
        clearAllData,
        // Cloud Status
        cloudStatus
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

