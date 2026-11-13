import React, { useState, useEffect, useMemo } from 'react';
import { X, Calendar, Check, AlertCircle, Trash2, Sparkles } from 'lucide-react';
import { formatDateKey, formatDisplayDate } from '../../utils/dateUtils';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const CalorieEntryModal = ({
  isOpen,
  onClose,
  initialDate,
  initialData,
  onSaved,
  onDeleted,
}) => {
  const { showToast, triggerCelebration } = useToast();

  const [date, setDate] = useState(initialDate || formatDateKey(new Date()));
  const [minCalories, setMinCalories] = useState('');
  const [maxCalories, setMaxCalories] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError('');
      const targetDate = initialDate || formatDateKey(new Date());
      setDate(targetDate);

      if (initialData) {
        setMinCalories(initialData.minCalories?.toString() || '');
        setMaxCalories(initialData.maxCalories?.toString() || '');
        setNotes(initialData.notes || '');
        setIsEditMode(true);
      } else {
        // Fetch if existing entry exists for targetDate
        checkExistingEntry(targetDate);
      }
    }
  }, [isOpen, initialDate, initialData]);

  const checkExistingEntry = async (dateStr) => {
    try {
      const res = await api.get(`/entries/${dateStr}`);
      if (res.data?.success && res.data?.data) {
        const item = res.data.data;
        setMinCalories(item.minCalories?.toString() || '');
        setMaxCalories(item.maxCalories?.toString() || '');
        setNotes(item.notes || '');
        setIsEditMode(true);
      } else {
        setMinCalories('');
        setMaxCalories('');
        setNotes('');
        setIsEditMode(false);
      }
    } catch (err) {
      // 404 is expected if not logged yet
      setMinCalories('');
      setMaxCalories('');
      setNotes('');
      setIsEditMode(false);
    }
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
    checkExistingEntry(newDate);
  };

  // Automatically calculate midpoint
  const midpoint = useMemo(() => {
    const min = parseFloat(minCalories);
    const max = parseFloat(maxCalories);
    if (!isNaN(min) && !isNaN(max) && min >= 0 && max >= min) {
      return Math.round((min + max) / 2);
    }
    return null;
  }, [minCalories, maxCalories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const min = parseFloat(minCalories);
    const max = parseFloat(maxCalories);

    if (isNaN(min) || isNaN(max)) {
      setError('Please provide valid numbers for both minimum and maximum calories.');
      return;
    }

    if (min < 0 || max < 0) {
      setError('Calorie values cannot be negative.');
      return;
    }

    if (min > max) {
      setError('Minimum calories cannot exceed maximum calories.');
      return;
    }

    setLoading(true);

    try {
      let res;
      if (isEditMode) {
        res = await api.put(`/entries/${date}`, {
          minCalories: min,
          maxCalories: max,
          notes,
        });
      } else {
        res = await api.post('/entries', {
          date,
          minCalories: min,
          maxCalories: max,
          notes,
        });
      }

      if (res.data?.success) {
        showToast(
          isEditMode
            ? `Calorie entry for ${formatDisplayDate(date)} updated.`
            : `Logged ${min} – ${max} kcal for ${formatDisplayDate(date)}! Consistency +1!`,
          'success'
        );

        // Check if new achievement unlocked
        if (res.data?.newlyUnlocked && res.data.newlyUnlocked.length > 0) {
          triggerCelebration(res.data.newlyUnlocked[0]);
        }

        if (onSaved) {
          onSaved(res.data.data, res.data.streakData);
        }
        onClose();
      }
    } catch (err) {
      console.error('Error saving entry:', err);
      setError(err.response?.data?.message || 'Failed to save daily entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete the entry for ${formatDisplayDate(date)}?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await api.delete(`/entries/${date}`);
      if (res.data?.success) {
        showToast(`Entry for ${formatDisplayDate(date)} deleted.`, 'info');
        if (onDeleted) {
          onDeleted(date, res.data.streakData);
        }
        onClose();
      }
    } catch (err) {
      console.error('Delete error:', err);
      showToast(err.response?.data?.message || 'Failed to delete entry.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#111726] border border-[#24304d] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#24304d]/70 bg-[#141b2d]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white tracking-tight">
                {isEditMode ? 'Edit Calorie Intake' : 'Log Daily Calorie Estimate'}
              </h3>
              <p className="text-xs text-slate-400">
                Consistency over perfection. Rough estimates count!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1f2a44] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Date Picker Field */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
              Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={date}
                max={formatDateKey(new Date())}
                onChange={(e) => handleDateChange(e.target.value)}
                required
                className="w-full bg-[#161e31] border border-[#24304d] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Selected: {formatDisplayDate(date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          {/* Calorie Range Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
                Min Calories (kcal)
              </label>
              <input
                type="number"
                min="0"
                step="25"
                placeholder="e.g. 1800"
                value={minCalories}
                onChange={(e) => setMinCalories(e.target.value)}
                required
                className="w-full bg-[#161e31] border border-[#24304d] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder:text-slate-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
                Max Calories (kcal)
              </label>
              <input
                type="number"
                min="0"
                step="25"
                placeholder="e.g. 2100"
                value={maxCalories}
                onChange={(e) => setMaxCalories(e.target.value)}
                required
                className="w-full bg-[#161e31] border border-[#24304d] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder:text-slate-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Automatic Range & Midpoint Preview Card */}
          <div className="p-3.5 bg-[#0e1422] border border-[#24304d]/80 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">
                Calorie Range Preview
              </span>
              <span className="text-sm font-bold font-mono text-white">
                {minCalories && maxCalories
                  ? `${minCalories} – ${maxCalories} kcal`
                  : 'Enter min & max above'}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[11px] uppercase tracking-wider text-emerald-400 block font-medium">
                Calculated Midpoint
              </span>
              <span className="text-base font-extrabold font-mono text-emerald-400">
                {midpoint !== null ? `${midpoint} kcal` : '—'}
              </span>
            </div>
          </div>

          {/* Optional Notes Field */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
              Optional Notes (e.g. ChatGPT summary, meals, workout)
            </label>
            <textarea
              rows="3"
              placeholder="e.g. Oatmeal breakfast, grilled chicken salad, post-workout shake..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={1000}
              className="w-full bg-[#161e31] border border-[#24304d] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl p-3 text-sm text-white placeholder:text-slate-500 focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[#24304d]/70">
            {isEditMode ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || loading}
                className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'Deleting...' : 'Delete Entry'}</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-[#161e31] rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm rounded-xl transition-all shadow-md shadow-emerald-950/40 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{loading ? 'Saving...' : isEditMode ? 'Update Entry' : 'Save & Count Streak'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
