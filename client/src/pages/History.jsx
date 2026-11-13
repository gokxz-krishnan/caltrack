import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../services/api';
import { formatDisplayDate, formatDateKey } from '../utils/dateUtils';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { useToast } from '../context/ToastContext';
import {
  Calendar,
  Filter,
  Search,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  X,
} from 'lucide-react';

export const History = () => {
  const { onOpenLogModal } = useOutletContext();
  const { showToast } = useToast();

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);

  // Filters
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Delete modal state
  const [deleteTargetDate, setDeleteTargetDate] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
      });

      if (selectedYear) params.append('year', selectedYear);
      if (selectedMonth) params.append('month', selectedMonth);

      const res = await api.get(`/entries?${params.toString()}`);
      if (res.data?.success) {
        setEntries(res.data.data);
        setTotalPages(res.data.pagination.totalPages);
        setTotalEntries(res.data.pagination.total);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  }, [page, selectedYear, selectedMonth]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Global listener for entries saved/deleted elsewhere
  useEffect(() => {
    const handleEntrySaved = () => fetchEntries();
    window.addEventListener('caltrack:entry-saved', handleEntrySaved);
    return () => window.removeEventListener('caltrack:entry-saved', handleEntrySaved);
  }, [fetchEntries]);

  const confirmDelete = async () => {
    if (!deleteTargetDate) return;
    setIsDeleting(true);

    try {
      const res = await api.delete(`/entries/${deleteTargetDate}`);
      if (res.data?.success) {
        showToast(`Entry for ${formatDisplayDate(deleteTargetDate)} deleted.`, 'info');
        setDeleteTargetDate(null);
        fetchEntries();
        window.dispatchEvent(new CustomEvent('caltrack:entry-saved'));
      }
    } catch (err) {
      console.error('Error deleting entry:', err);
      showToast(err.response?.data?.message || 'Failed to delete entry.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Client-side text filter on the currently loaded batch for fast search
  const filteredEntries = entries.filter((e) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      e.date.includes(term) ||
      (e.notes && e.notes.toLowerCase().includes(term)) ||
      e.minCalories.toString().includes(term) ||
      e.maxCalories.toString().includes(term)
    );
  });

  const clearFilters = () => {
    setSelectedMonth('');
    setSelectedYear('');
    setSearchTerm('');
    setPage(1);
  };

  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Calorie Tracking History
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse, filter, edit, or remove all recorded daily calorie estimates.
          </p>
        </div>

        <button
          onClick={() => onOpenLogModal(null)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm rounded-xl transition-all shadow-md shadow-emerald-950/40 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Entry</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#111726] border border-[#24304d] rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-lg">
        <div className="flex flex-1 items-center space-x-2 bg-[#161e31] border border-[#24304d] rounded-xl px-3 py-2">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by notes, date (YYYY-MM-DD), or calories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none w-full"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Year select */}
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setPage(1);
            }}
            className="bg-[#161e31] border border-[#24304d] text-xs font-medium text-slate-200 rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
          >
            <option value="">All Years</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>

          {/* Month select */}
          <select
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              setPage(1);
            }}
            className="bg-[#161e31] border border-[#24304d] text-xs font-medium text-slate-200 rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
          >
            <option value="">All Months</option>
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          {(selectedYear || selectedMonth || searchTerm) && (
            <button
              onClick={clearFilters}
              className="text-xs text-rose-400 hover:text-rose-300 px-3 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* History Table Container */}
      <div className="bg-[#111726] border border-[#24304d] rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Loading calorie logs..." />
        ) : filteredEntries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#161e31]/80 border-b border-[#24304d] text-[11px] text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-5 font-semibold">Date</th>
                  <th className="py-3.5 px-5 font-semibold">Min Calories</th>
                  <th className="py-3.5 px-5 font-semibold">Max Calories</th>
                  <th className="py-3.5 px-5 font-semibold">Calculated Midpoint</th>
                  <th className="py-3.5 px-5 font-semibold">Notes</th>
                  <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#24304d]/40">
                {filteredEntries.map((entry) => (
                  <tr
                    key={entry.date}
                    className="hover:bg-[#161e31]/60 transition-colors group"
                  >
                    <td className="py-3.5 px-5 font-medium text-slate-100 whitespace-nowrap">
                      {formatDisplayDate(entry.date, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-emerald-400 font-semibold whitespace-nowrap">
                      {entry.minCalories} kcal
                    </td>
                    <td className="py-3.5 px-5 font-mono text-emerald-400 font-semibold whitespace-nowrap">
                      {entry.maxCalories} kcal
                    </td>
                    <td className="py-3.5 px-5 font-mono text-white font-bold whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-[#0d1424] border border-[#24304d] text-emerald-300">
                        {entry.midpointCalories} kcal
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-400 text-xs max-w-sm truncate">
                      {entry.notes || <span className="text-slate-600 italic">None</span>}
                    </td>
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => onOpenLogModal(entry.date)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-[#1f2a44] transition-colors"
                          title="Edit Entry"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetDate(entry.date)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete Entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8">
            <EmptyState
              title="No entries match your search"
              description="Try adjusting your date filters or record a new daily calorie estimate."
              actionText="Record Entry"
              onAction={() => onOpenLogModal(null)}
            />
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[#24304d] flex items-center justify-between text-xs text-slate-400 bg-[#0d121e]">
            <span>
              Showing page <strong className="text-white">{page}</strong> of{' '}
              <strong className="text-white">{totalPages}</strong> ({totalEntries} total entries)
            </span>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-[#161e31] hover:bg-[#1f2a44] border border-[#24304d] rounded-xl text-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-[#161e31] hover:bg-[#1f2a44] border border-[#24304d] rounded-xl text-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteTargetDate}
        title="Delete Daily Entry"
        message={`Are you sure you want to permanently delete the calorie entry for ${formatDisplayDate(
          deleteTargetDate
        )}? Streak calculations will update accordingly.`}
        confirmText="Yes, Delete Entry"
        isDanger={true}
        loading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetDate(null)}
      />
    </div>
  );
};
