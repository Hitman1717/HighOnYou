import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Utensils, Plus, Trash2, Calendar, Droplets } from 'lucide-react';

export default function DietTrackerView() {
  const {
    activeProfile,
    selectedDate,
    setSelectedDate,
    getActiveUserDayDiet,
    addFoodItem,
    deleteFoodItem,
    updateWaterGlasses
  } = useApp();

  const [mealType, setMealType] = useState('Breakfast');
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');

  const dayDiet = getActiveUserDayDiet(selectedDate);
  const meals = dayDiet.meals || [];
  const water = dayDiet.waterGlasses || 0;

  // Totals
  let totalCalories = 0;
  let totalProtein = 0;
  meals.forEach((m) => {
    m.items?.forEach((i) => {
      totalCalories += Number(i.calories) || 0;
      totalProtein += Number(i.protein) || 0;
    });
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!foodName.trim()) {
      alert('Please enter a food name.');
      return;
    }

    addFoodItem(
      mealType,
      {
        name: foodName.trim(),
        calories: Number(calories) || 0,
        protein: Number(protein) || 0,
        carbs: 0,
        fat: 0,
        serving: '1 serving'
      },
      selectedDate
    );

    setFoodName('');
    setCalories('');
    setProtein('');
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      
      {/* Title & Date */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {activeProfile.name}'s Daily Diet
          </h2>
          <p className="text-xs text-gray-500">Track meals, calories & protein</p>
        </div>

        <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-xs">
          <Calendar className="w-3.5 h-3.5 text-gray-500" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-gray-700 text-xs focus:outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* TODAY'S TOTALS SUMMARY */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl p-3.5 text-center shadow-sm">
          <span className="text-[11px] font-semibold text-gray-500 uppercase">
            Total Calories
          </span>
          <div className="text-xl font-black text-gray-900 mt-0.5">
            {totalCalories} <span className="text-xs font-normal text-gray-500">kcal</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-3.5 text-center shadow-sm">
          <span className="text-[11px] font-semibold text-gray-500 uppercase">
            Total Protein
          </span>
          <div className="text-xl font-black text-emerald-600 mt-0.5">
            {totalProtein} <span className="text-xs font-normal text-gray-500">g</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-3.5 text-center shadow-sm flex flex-col items-center justify-center">
          <span className="text-[11px] font-semibold text-gray-500 uppercase">
            Water
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <button
              onClick={() => updateWaterGlasses(-1)}
              disabled={water <= 0}
              className="text-xs px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 disabled:opacity-30"
            >
              -
            </button>
            <span className="text-sm font-bold text-blue-600 font-mono">
              {water} 🥛
            </span>
            <button
              onClick={() => updateWaterGlasses(1)}
              className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-bold"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* WHITE CARD: LOG FOOD */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
          <Utensils className="w-4 h-4 text-emerald-600" />
          Log Food
        </h3>

        <form onSubmit={handleAdd} className="space-y-3">
          <div className="flex gap-2">
            {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((m) => (
              <button
                type="button"
                key={m}
                onClick={() => setMealType(m)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition ${
                  mealType === m
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Food Description
            </label>
            <input
              type="text"
              required
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              placeholder="e.g. Chicken breast with rice, 3 Eggs..."
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-gray-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Calories (kcal)
              </label>
              <input
                type="number"
                min="0"
                required
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="e.g. 350"
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Protein (g)
              </label>
              <input
                type="number"
                min="0"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="e.g. 30"
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-gray-900"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs tracking-wide transition shadow-sm"
          >
            Add to {mealType}
          </button>
        </form>
      </div>

      {/* TODAY'S MEALS BREAKDOWN */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-gray-900">Today's Meals</h3>

        <div className="space-y-3">
          {meals.map((m) => (
            <div
              key={m.id}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
            >
              <div className="font-bold text-xs text-gray-900 pb-2 border-b border-gray-100 flex items-center justify-between">
                <span>{m.name}</span>
                <span className="text-gray-400 font-normal">
                  {m.items?.reduce((acc, i) => acc + (Number(i.calories) || 0), 0) || 0} kcal
                </span>
              </div>

              {m.items?.length === 0 ? (
                <div className="text-xs text-gray-400 py-2">Nothing logged yet.</div>
              ) : (
                <div className="space-y-1.5 pt-2">
                  {m.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-xs py-1 text-gray-800"
                    >
                      <span className="font-medium">{item.name}</span>
                      <div className="flex items-center gap-3 text-gray-500">
                        <span className="font-bold text-gray-900">{item.calories} kcal</span>
                        {item.protein > 0 && (
                          <span className="text-emerald-600">{item.protein}g P</span>
                        )}
                        <button
                          onClick={() => deleteFoodItem(m.id, item.id, selectedDate)}
                          className="text-gray-300 hover:text-red-500 p-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
