import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Dumbbell, Plus, Trash2, Edit2, Check, Calendar, X, Search } from 'lucide-react';

const SUGGESTIONS = [
  'Bench Press',
  'Squats',
  'Deadlift',
  'Overhead Press',
  'Incline Dumbbell Press',
  'Barbell Row',
  'Lat Pulldown',
  'Bicep Curls',
  'Tricep Pushdown'
];

export default function GymTrackerView() {
  const {
    activeProfile,
    selectedDate,
    setSelectedDate,
    getActiveUserGymLogs,
    addExercise,
    updateExercise,
    deleteExercise
  } = useApp();

  const [exerciseName, setExerciseName] = useState('');
  const [logDate, setLogDate] = useState(selectedDate);
  const [sets, setSets] = useState([
    { setNumber: 1, weight: '', reps: '' },
    { setNumber: 2, weight: '', reps: '' },
    { setNumber: 3, weight: '', reps: '' }
  ]);
  const [search, setSearch] = useState('');
  const [savedFeedback, setSavedFeedback] = useState('');
  const [editingItem, setEditingItem] = useState(null);

  const logs = getActiveUserGymLogs();

  const handleAddSet = () => {
    const last = sets[sets.length - 1];
    setSets([
      ...sets,
      {
        setNumber: sets.length + 1,
        weight: last ? last.weight : '',
        reps: last ? last.reps : ''
      }
    ]);
  };

  const handleRemoveSet = (idx) => {
    if (sets.length <= 1) return;
    const filtered = sets.filter((_, i) => i !== idx);
    setSets(filtered.map((s, i) => ({ ...s, setNumber: i + 1 })));
  };

  const handleSetChange = (idx, field, val) => {
    const updated = [...sets];
    updated[idx] = { ...updated[idx], [field]: val };
    setSets(updated);
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (!exerciseName.trim()) {
      alert('Please enter an exercise name.');
      return;
    }

    const validSets = sets.filter((s) => s.weight !== '' || s.reps !== '');
    if (validSets.length === 0) {
      alert('Please fill in at least one set with weight and reps.');
      return;
    }

    addExercise({
      exerciseName: exerciseName.trim(),
      date: logDate || selectedDate,
      sets: validSets.map((s, idx) => ({
        setNumber: idx + 1,
        weight: parseFloat(s.weight) || 0,
        reps: parseInt(s.reps) || 0
      }))
    });

    setSavedFeedback(`Saved ${exerciseName.trim()}!`);
    setTimeout(() => setSavedFeedback(''), 2500);

    setExerciseName('');
    setSets([
      { setNumber: 1, weight: '', reps: '' },
      { setNumber: 2, weight: '', reps: '' },
      { setNumber: 3, weight: '', reps: '' }
    ]);
  };

  const filteredLogs = logs.filter((l) =>
    l.exerciseName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      
      {/* Title & Date */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {activeProfile.name}'s Gym Log
          </h2>
          <p className="text-xs text-gray-500">Track exercise name, sets, weight & reps</p>
        </div>

        <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-xs">
          <Calendar className="w-3.5 h-3.5 text-gray-500" />
          <input
            type="date"
            value={logDate}
            onChange={(e) => {
              setLogDate(e.target.value);
              setSelectedDate(e.target.value);
            }}
            className="bg-transparent text-gray-700 text-xs focus:outline-none cursor-pointer"
          />
        </div>
      </div>

      {savedFeedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 font-medium">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{savedFeedback}</span>
        </div>
      )}

      {/* WHITE CARD: EXERCISE LOGGER */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-gray-700" />
          Log Exercise
        </h3>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Exercise Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Exercise Name
            </label>
            <input
              type="text"
              required
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              placeholder="e.g. Bench Press, Squats, Pull-ups"
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
            />

            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {SUGGESTIONS.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setExerciseName(s)}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Sets Table */}
          <div className="space-y-2 border-t border-gray-100 pt-3">
            <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold text-gray-500 uppercase px-1">
              <div className="col-span-2 text-center">Set</div>
              <div className="col-span-5 text-center">Weight (kg)</div>
              <div className="col-span-4 text-center">Reps</div>
              <div className="col-span-1"></div>
            </div>

            {sets.map((s, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-2 text-center text-xs font-bold text-gray-500">
                  #{s.setNumber}
                </div>

                <div className="col-span-5">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="Weight"
                    value={s.weight}
                    onChange={(e) => handleSetChange(idx, 'weight', e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-center text-xs font-semibold text-gray-900 focus:outline-none focus:border-gray-900"
                  />
                </div>

                <div className="col-span-4">
                  <input
                    type="number"
                    min="1"
                    placeholder="Reps"
                    value={s.reps}
                    onChange={(e) => handleSetChange(idx, 'reps', e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-center text-xs font-semibold text-gray-900 focus:outline-none focus:border-gray-900"
                  />
                </div>

                <div className="col-span-1 flex justify-center">
                  {sets.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => handleRemoveSet(idx)}
                      className="text-gray-400 hover:text-red-500 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : null}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddSet}
              className="w-full py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-dashed border-gray-300 rounded-lg transition flex items-center justify-center gap-1 mt-1"
            >
              <Plus className="w-3 h-3" />
              Add Another Set
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-gray-900 hover:bg-black text-white font-semibold text-xs tracking-wide transition shadow-sm"
          >
            Save Exercise
          </button>
        </form>
      </div>

      {/* LOGGED EXERCISES LIST */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-gray-900">
            Past Exercises ({filteredLogs.length})
          </h3>

          <div className="relative w-48">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter..."
              className="w-full bg-white border border-gray-200 rounded-lg pl-8 pr-2 py-1 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400"
            />
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-xs text-gray-400">
            No exercises logged yet.
          </div>
        ) : (
          <div className="space-y-2">
            {filteredLogs.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:border-gray-300 transition"
              >
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">
                      {item.exerciseName}
                    </h4>
                    <span className="text-[11px] text-gray-400">{item.date}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingItem(item)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete ${item.exerciseName}?`)) {
                          deleteExercise(item.id);
                        }
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sets display */}
                <div className="flex flex-wrap gap-2 mt-2.5">
                  {item.sets?.map((s, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 border border-gray-200 rounded-md px-2.5 py-1 text-xs text-gray-700"
                    >
                      <span className="text-gray-400 mr-1.5">Set {s.setNumber}:</span>
                      <span className="font-bold text-gray-900">{s.weight} kg</span>
                      <span className="text-gray-500 ml-1">× {s.reps} reps</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SIMPLE EDIT MODAL */}
      {editingItem && (
        <EditModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={(data) => {
            updateExercise(editingItem.id, data);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
}

function EditModal({ item, onClose, onSave }) {
  const [exerciseName, setExerciseName] = useState(item.exerciseName);
  const [date, setDate] = useState(item.date);
  const [sets, setSets] = useState(
    item.sets && item.sets.length > 0
      ? item.sets.map((s, idx) => ({
          setNumber: s.setNumber || idx + 1,
          weight: s.weight.toString(),
          reps: s.reps.toString()
        }))
      : [{ setNumber: 1, weight: '', reps: '' }]
  );

  const handleSetChange = (idx, field, val) => {
    const updated = [...sets];
    updated[idx] = { ...updated[idx], [field]: val };
    setSets(updated);
  };

  const handleAddSet = () => {
    setSets([...sets, { setNumber: sets.length + 1, weight: '', reps: '' }]);
  };

  const handleRemoveSet = (idx) => {
    if (sets.length <= 1) return;
    const filtered = sets.filter((_, i) => i !== idx);
    setSets(filtered.map((s, i) => ({ ...s, setNumber: i + 1 })));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      exerciseName,
      date,
      sets: sets.map((s, idx) => ({
        setNumber: idx + 1,
        weight: parseFloat(s.weight) || 0,
        reps: parseInt(s.reps) || 0
      }))
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white border border-gray-200 rounded-xl w-full max-w-sm p-4 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <h4 className="font-bold text-sm text-gray-900">Edit Exercise</h4>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Exercise Name
            </label>
            <input
              type="text"
              required
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-gray-900"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-600">Sets</label>
            {sets.map((s, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="text-xs text-gray-400 w-10">#{s.setNumber}</span>
                <input
                  type="number"
                  step="0.5"
                  placeholder="kg"
                  value={s.weight}
                  onChange={(e) => handleSetChange(idx, 'weight', e.target.value)}
                  className="w-20 bg-white border border-gray-300 rounded-md px-2 py-1 text-xs text-center font-semibold"
                />
                <span className="text-xs text-gray-400">kg ×</span>
                <input
                  type="number"
                  placeholder="reps"
                  value={s.reps}
                  onChange={(e) => handleSetChange(idx, 'reps', e.target.value)}
                  className="w-16 bg-white border border-gray-300 rounded-md px-2 py-1 text-xs text-center font-semibold"
                />
                <span className="text-xs text-gray-400">reps</span>
                {sets.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSet(idx)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddSet}
              className="text-[11px] text-gray-600 hover:text-black font-semibold pt-1"
            >
              + Add Set
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-semibold text-white bg-gray-900 hover:bg-black rounded-lg"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
