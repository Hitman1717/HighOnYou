import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { COMMON_FOODS } from '../../data/foodDatabase';
import { X, Check, Utensils, Plus, Sparkles } from 'lucide-react';

export default function AddFoodModal({ initialMeal = 'Breakfast', onClose }) {
  const { addFoodItem, selectedDate } = useApp();

  const [mealName, setMealName] = useState(initialMeal);
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [serving, setServing] = useState('100g');
  const [selectedQuickFood, setSelectedQuickFood] = useState(null);

  const handleSelectQuickFood = (food) => {
    setSelectedQuickFood(food.name);
    setFoodName(food.name);
    setCalories(food.calories.toString());
    setProtein(food.protein.toString());
    setCarbs(food.carbs.toString());
    setFat(food.fat.toString());
    setServing(food.serving);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!foodName.trim()) {
      alert('Please enter a food name');
      return;
    }

    addFoodItem(
      mealName,
      {
        name: foodName.trim(),
        calories: Number(calories) || 0,
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
        serving
      },
      selectedDate
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base sm:text-lg">
                Log Food / Meal
              </h3>
              <p className="text-xs text-slate-400">Add calories and macronutrients</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* Meal Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Meal Time
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['Breakfast', 'Lunch', 'Dinner', 'Snacks & Pre-Workout'].map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setMealName(m)}
                  className={`text-xs py-2 px-2 rounded-xl font-medium transition text-center truncate ${
                    mealName.toLowerCase() === m.toLowerCase()
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                  }`}
                >
                  {m.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Quick-Pick Popular Foods */}
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-2">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Quick-Add Common Healthy Foods:
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
              {COMMON_FOODS.map((f) => (
                <button
                  type="button"
                  key={f.name}
                  onClick={() => handleSelectQuickFood(f)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                    selectedQuickFood === f.name
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700/60 text-slate-300'
                  }`}
                >
                  {f.name} ({f.protein}g P)
                </button>
              ))}
            </div>
          </div>

          {/* Food Name & Serving */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Food Description
              </label>
              <input
                type="text"
                required
                value={foodName}
                onChange={(e) => {
                  setFoodName(e.target.value);
                  setSelectedQuickFood(null);
                }}
                placeholder="e.g. Scrambled Eggs with Avocado"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Serving Size
              </label>
              <input
                type="text"
                value={serving}
                onChange={(e) => setServing(e.target.value)}
                placeholder="100g or 1 cup"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Macros Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <div>
              <label className="block text-[11px] font-semibold text-amber-400 mb-1">
                Calories (kcal)
              </label>
              <input
                type="number"
                min="0"
                required
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="250"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm font-mono font-bold text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-emerald-400 mb-1">
                Protein (g)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="25"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-blue-400 mb-1">
                Carbs (g)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                placeholder="30"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm font-mono font-bold text-blue-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-rose-400 mb-1">
                Fats (g)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                placeholder="8"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm font-mono font-bold text-rose-400 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

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
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/25 transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Add to {mealName}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

