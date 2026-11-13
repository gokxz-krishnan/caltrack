import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { StatCard } from '../components/dashboard/StatCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  Flame,
  Scale,
  TrendingUp,
  Calendar,
  ArrowUp,
  ArrowDown,
  Info,
  Activity,
  BarChart2,
} from 'lucide-react';
import { formatDisplayDate } from '../utils/dateUtils';

// Custom Tooltip for Recharts
const CustomChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#0b101c] border border-[#24304d] rounded-xl p-3 shadow-2xl text-xs space-y-1 font-sans">
        <p className="font-semibold text-white mb-1">
          {formatDisplayDate(label, { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
        <div className="flex items-center justify-between space-x-4 text-emerald-400 font-mono">
          <span>Range:</span>
          <span>{data.minCalories} – {data.maxCalories} kcal</span>
        </div>
        <div className="flex items-center justify-between space-x-4 text-slate-300 font-mono">
          <span>Midpoint:</span>
          <span className="font-bold text-white">{data.midpointCalories} kcal</span>
        </div>
        {data.notes && (
          <p className="text-[10px] text-slate-400 italic pt-1 border-t border-[#24304d] truncate max-w-[200px]">
            "{data.notes}"
          </p>
        )}
      </div>
    );
  }
  return null;
};

export const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/statistics');
        if (res.data?.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Analyzing your calorie trends and statistics..." />;
  }

  const {
    totalTrackedDays = 0,
    currentStreak = 0,
    longestStreak = 0,
    averageDailyMidpoint = 0,
    averageMinCalories = 0,
    averageMaxCalories = 0,
    highestCalorieEstimate = 0,
    lowestCalorieEstimate = 0,
    weeklyAverage = 0,
    monthlyAverage = 0,
    last30DaysConsistencyPercentage = 0,
    trendData = [],
    weeklyDistribution = [],
    monthlyTrends = [],
  } = stats || {};

  if (totalTrackedDays === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Calorie Statistics & Trends</h1>
          <p className="text-sm text-slate-400 mt-1">
            Visual breakdown of your estimated calorie intake and consistency.
          </p>
        </div>
        <EmptyState
          title="No calorie statistics yet"
          description="Log daily calorie intake to generate charts, averages, and consistency insights."
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div>
        <div className="flex items-center space-x-2.5">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Calorie Statistics & Progress
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            Real Analytics
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Tracking consistency and estimated calorie trends. All values are calculated estimates.
        </p>
      </div>

      {/* Primary Summary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Daily Midpoint Average"
          value={`${averageDailyMidpoint} kcal`}
          subtext={`Avg Range: ${averageMinCalories} – ${averageMaxCalories} kcal`}
          icon={Scale}
          accent="emerald"
        />

        <StatCard
          title="Past 7 Days Average"
          value={`${weeklyAverage} kcal`}
          subtext="Recent rolling 7-day midpoint estimate"
          icon={TrendingUp}
          accent="blue"
        />

        <StatCard
          title="Past 30 Days Average"
          value={`${monthlyAverage} kcal`}
          subtext={`Consistency: ${last30DaysConsistencyPercentage}% of days logged`}
          icon={Calendar}
          accent="purple"
        />

        <StatCard
          title="Highest / Lowest Estimate"
          value={`${highestCalorieEstimate} / ${lowestCalorieEstimate}`}
          subtext="Peak recorded max & minimum recorded kcal"
          icon={Activity}
          accent="amber"
        />
      </div>

      {/* Main Chart: Calorie Range Trend (ComposedChart with Range Band & Midpoint) */}
      <div className="bg-[#111726] border border-[#24304d] rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Calorie Range & Midpoint Trend
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Visualizing the estimated range [Min – Max] and daily calculated midpoint over recent days.
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500/30 border border-emerald-500" />
              <span className="text-slate-300">Calorie Range</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-0.5 bg-emerald-400" />
              <span className="text-emerald-400 font-medium">Midpoint</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="calorieBandGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2a44" opacity={0.5} />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={(val) => val.slice(5)}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomChartTooltip />} />
              <Area
                type="monotone"
                dataKey="maxCalories"
                stroke="#059669"
                strokeWidth={1}
                fill="url(#calorieBandGradient)"
                name="Max Calories"
              />
              <Line
                type="monotone"
                dataKey="midpointCalories"
                stroke="#34d399"
                strokeWidth={2.5}
                dot={{ fill: '#10b981', r: 3 }}
                activeDot={{ r: 5 }}
                name="Midpoint"
              />
              <Line
                type="monotone"
                dataKey="minCalories"
                stroke="#047857"
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
                name="Min Calories"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secondary Charts Grid: Day of Week Distribution & Monthly History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Day Distribution */}
        <div className="bg-[#111726] border border-[#24304d] rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Consistency by Day of Week
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Total entries logged per weekday across your tracking history.
              </p>
            </div>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <BarChart2 className="w-4 h-4" />
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyDistribution} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2a44" opacity={0.5} />
                <XAxis dataKey="day" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  formatter={(value, name) => [
                    name === 'count' ? `${value} days logged` : `${value} kcal`,
                    name === 'count' ? 'Logged Count' : 'Avg Midpoint',
                  ]}
                  contentStyle={{
                    backgroundColor: '#0b101c',
                    borderColor: '#24304d',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Averages Trend */}
        <div className="bg-[#111726] border border-[#24304d] rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Monthly Average Intake
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Average daily midpoint calories grouped by month.
              </p>
            </div>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>

          {monthlyTrends.length > 0 ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2a44" opacity={0.5} />
                  <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} domain={['auto', 'auto']} />
                  <Tooltip
                    formatter={(value) => [`${value} kcal`, 'Avg Daily Midpoint']}
                    contentStyle={{
                      backgroundColor: '#0b101c',
                      borderColor: '#24304d',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="avgMidpoint" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-xs text-slate-500">
              Not enough monthly data recorded yet.
            </div>
          )}
        </div>
      </div>

      {/* Informative Disclaimer Footer */}
      <div className="p-4 bg-[#0e1422] border border-[#24304d]/70 rounded-2xl flex items-start space-x-3 text-xs text-slate-400">
        <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Calorie Estimation Reminder:</strong> CalTrack operates on estimated minimum and maximum intake ranges (such as those from meal descriptions or quick mental estimates). Midpoints represent calculated statistical centers rather than lab-measured calories. Consistency in tracking remains the primary driver of fitness awareness.
        </p>
      </div>
    </div>
  );
};
