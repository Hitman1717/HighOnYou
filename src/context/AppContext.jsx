import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  INITIAL_PROFILES,
  INITIAL_GYM_LOGS,
  INITIAL_STRAVA_RUNS,
  INITIAL_DIET_LOGS
} from '../data/initialData';
import { db } from '../firebase';
import { doc, setDoc, deleteDoc, onSnapshot, getDoc } from 'firebase/firestore';

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

  // Cloud Sync Status: 'synced' | 'connecting' | 'error' | 'local'
  const [cloudStatus, setCloudStatus] = useState('connecting');
  const [firestoreError, setFirestoreError] = useState(null);

  // Real-time Firestore Synchronization for both athletes
  useEffect(() => {
    if (!db) {
      setCloudStatus('local');
      return;
    }

    const unsubs = [];

    ['user_1', 'user_2'].forEach((uid) => {
      try {
        const userDocRef = doc(db, 'athletes', uid);
        const unsub = onSnapshot(
          userDocRef,
          (snap) => {
            if (snap.exists()) {
              const data = snap.data();
              if (data.gymLogs && Array.isArray(data.gymLogs)) {
                setGymLogs((prev) => ({ ...prev, [uid]: data.gymLogs }));
              }
              if (data.stravaRuns && Array.isArray(data.stravaRuns)) {
                setStravaRuns((prev) => ({ ...prev, [uid]: data.stravaRuns }));
              }
              if (data.dietLogs) {
                setDietLogs((prev) => ({ ...prev, [uid]: data.dietLogs }));
              }
              if (data.name) {
                setProfiles((prev) =>
                  prev.map((p) => (p.id === uid ? { ...p, name: data.name } : p))
                );
              }
              setCloudStatus('synced');
              setFirestoreError(null);
            }
          },
          (error) => {
            console.debug(`Firestore sync error for ${uid}:`, error.message);
            setCloudStatus('error');
            setFirestoreError(error.message || 'Permission denied or Firestore disabled');
          }
        );
        unsubs.push(unsub);
      } catch (err) {
        console.debug('Firestore setup exception:', err);
        setCloudStatus('error');
        setFirestoreError(err.message);
      }
    });

    return () => unsubs.forEach((u) => u && u());
  }, []);

  // Helper to push a specific user's updates to Firestore
  const pushUserToFirestore = async (userId, updates) => {
    if (!db) return;
    try {
      const userDocRef = doc(db, 'athletes', userId);
      await setDoc(
        userDocRef,
        {
          id: userId,
          name: profiles.find((p) => p.id === userId)?.name || (userId === 'user_1' ? 'Rohit' : 'Vybhavi'),
          ...updates,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );
      setCloudStatus('synced');
      setFirestoreError(null);
    } catch (e) {
      console.debug('Firestore write failed:', e);
      setCloudStatus('error');
      setFirestoreError(e.message || 'Firestore write error');
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
      athleteId: activeProfileId,
      athleteName: activeProfile.name,
      date: date || selectedDate,
      exerciseName: exerciseName.trim(),
      sets: cleanSets,
      createdAt: new Date().toISOString()
    };

    setGymLogs((prev) => {
      const userList = [newExercise, ...(prev[activeProfileId] || [])];
      pushUserToFirestore(activeProfileId, { gymLogs: userList });
      return {
        ...prev,
        [activeProfileId]: userList
      };
    });

    if (db) {
      setDoc(doc(db, 'gym_exercises', newExercise.id), newExercise).catch(() => {});
    }

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

      pushUserToFirestore(activeProfileId, { gymLogs: updated });
      return {
        ...prev,
        [activeProfileId]: updated
      };
    });

    if (db) {
      setDoc(doc(db, 'gym_exercises', exerciseId), {
        exerciseName: exerciseName.trim(),
        date: date || selectedDate,
        sets: cleanSets,
        updatedAt: new Date().toISOString()
      }, { merge: true }).catch(() => {});
    }
  };

  const deleteExercise = (exerciseId) => {
    setGymLogs((prev) => {
      const currentList = prev[activeProfileId] || [];
      const updated = [];

      currentList.forEach((item) => {
        if (item.id === exerciseId) {
          return;
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

      pushUserToFirestore(activeProfileId, { gymLogs: updated });
      return {
        ...prev,
        [activeProfileId]: updated
      };
    });

    if (db) {
      deleteDoc(doc(db, 'gym_exercises', exerciseId)).catch(() => {});
    }
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
      const userRuns = [newRun, ...(prev[activeProfileId] || [])];
      pushUserToFirestore(activeProfileId, { stravaRuns: userRuns });
      return {
        ...prev,
        [activeProfileId]: userRuns
      };
    });
    return newRun;
  };

  const deleteStravaRun = (runId) => {
    setStravaRuns((prev) => {
      const userRuns = (prev[activeProfileId] || []).filter((r) => r.id !== runId);
      pushUserToFirestore(activeProfileId, { stravaRuns: userRuns });
      return {
        ...prev,
        [activeProfileId]: userRuns
      };
    });
  };

  const giveKudos = (runId, targetUserId = activeProfileId) => {
    setStravaRuns((prev) => {
      const userRuns = (prev[targetUserId] || []).map((r) => {
        if (r.id === runId) {
          const currentlyLiked = r.hasGivenKudos;
          return {
            ...r,
            kudos: currentlyLiked ? r.kudos - 1 : r.kudos + 1,
            hasGivenKudos: !currentlyLiked
          };
        }
        return r;
      });
      pushUserToFirestore(targetUserId, { stravaRuns: userRuns });
      return {
        ...prev,
        [targetUserId]: userRuns
      };
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

      const updatedUserDiets = {
        ...userDiets,
        [date]: {
          ...currentDay,
          meals: updatedMeals
        }
      };

      pushUserToFirestore(activeProfileId, { dietLogs: updatedUserDiets });

      return {
        ...prev,
        [activeProfileId]: updatedUserDiets
      };
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

      const updatedUserDiets = {
        ...userDiets,
        [date]: {
          ...currentDay,
          meals: updatedMeals
        }
      };

      pushUserToFirestore(activeProfileId, { dietLogs: updatedUserDiets });

      return {
        ...prev,
        [activeProfileId]: updatedUserDiets
      };
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

      const updatedUserDiets = {
        ...userDiets,
        [date]: {
          ...currentDay,
          waterGlasses: newCount
        }
      };

      pushUserToFirestore(activeProfileId, { dietLogs: updatedUserDiets });

      return {
        ...prev,
        [activeProfileId]: updatedUserDiets
      };
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
    pushUserToFirestore('user_1', { gymLogs: [], stravaRuns: [], dietLogs: {} });
    pushUserToFirestore('user_2', { gymLogs: [], stravaRuns: [], dietLogs: {} });
  };

  const resetToSampleData = clearAllData;

  const testCloudConnection = async () => {
    if (!db) return { success: false, error: 'Firebase is not initialized' };
    try {
      const pingDoc = doc(db, 'system', 'connection_test');
      await setDoc(pingDoc, { ping: true, testedAt: new Date().toISOString() });
      setCloudStatus('synced');
      setFirestoreError(null);
      return { success: true };
    } catch (err) {
      console.warn('Test connection error:', err);
      setCloudStatus('error');
      setFirestoreError(err.message);
      return { success: false, error: err.message };
    }
  };

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
        cloudStatus,
        firestoreError,
        testCloudConnection
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

