import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Check, User, Flame, Target, Droplets } from 'lucide-react';

export default function ProfileEditModal({ profile, onClose }) {
  const { updateProfile } = useApp();

  const [formData, setFormData] = useState({
    name: profile.name,
    tagline: profile.tagline || '',
    avatar: profile.avatar || '⚡',
    weight: profile.weight || 70,
    unit: profile.unit || 'kg',
    calorieTarget: profile.calorieTarget || 2400,
    proteinTarget: profile.proteinTarget || 160,
    carbTarget: profile.carbTarget || 260,
    fatTarget: profile.fatTarget || 65,
    waterTarget: profile.waterTarget || 8
  });

  const avatarOptions = ['⚡', '🔥', '💪', '🏃‍♂️', '🐺', '🦁', '🦍', '🎯', '🚀', '⭐'];

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(profile.id, {
      ...formData,
      weight: parseFloat(formData.weight) || 70,
      calorieTarget: parseInt(formData.calorieTarget) || 2000,
      proteinTarget: parseInt(formData.proteinTarget) || 150,
      carbTarget: parseInt(formData.carbTarget) || 250,
      fatTarget: parseInt(formData.fatTarget) || 60,
      waterTarget: parseInt(formData.waterTarget) || 8
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <span className="text-xl">{formData.avatar}</span>
            <h3 className="font-bold text-slate-100">Edit Athlete Profile</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Avatar picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">
              Choose Avatar
            </label>
            <div className="flex flex-wrap gap-2">
              {avatarOptions.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setFormData({ ...formData, avatar: emoji })}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition ${
                    formData.avatar === emoji
                      ? 'bg-orange-500/20 border-2 border-orange-500 shadow-md shadow-orange-500/20'
                      : 'bg-slate-800/80 border border-slate-700/60 hover:bg-slate-700'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Name & Tagline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Athlete Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Body Weight ({formData.unit})
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Motto / Fitness Goal
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              placeholder="e.g. 100kg Bench & Sub-25m 5k"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Daily Nutrition Goals */}
          <div className="pt-2 border-t border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-orange-400" />
              Daily Nutrition Targets
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Daily Calorie Target (kcal)
                </label>
                <input
                  type="number"
                  value={formData.calorieTarget}
                  onChange={(e) => setFormData({ ...formData, calorieTarget: e.target.value })}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Protein Target (g)
                </label>
                <input
                  type="number"
                  value={formData.proteinTarget}
                  onChange={(e) => setFormData({ ...formData, proteinTarget: e.target.value })}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Carbs Target (g)
                </label>
                <input
                  type="number"
                  value={formData.carbTarget}
                  onChange={(e) => setFormData({ ...formData, carbTarget: e.target.value })}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Fat Target (g)
                </label>
                <input
                  type="number"
                  value={formData.fatTarget}
                  onChange={(e) => setFormData({ ...formData, fatTarget: e.target.value })}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/25 transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Save Athlete Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

