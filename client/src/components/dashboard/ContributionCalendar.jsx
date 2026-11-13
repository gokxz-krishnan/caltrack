import React, { useState, useMemo } from 'react';
import { generateCalendarYearGrid, formatDisplayDate } from '../../utils/dateUtils';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info } from 'lucide-react';

export const ContributionCalendar = ({
  daysMap = {},
  selectedYear = new Date().getFullYear(),
  availableYears = [new Date().getFullYear()],
  onYearChange,
  onDayClick,
}) => {
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Generate 52/53 weeks of the selected year
  const { weeks, monthLabels } = useMemo(() => {
    return generateCalendarYearGrid(selectedYear);
  }, [selectedYear]);

  // Compute total logged days in this year
  const totalLoggedThisYear = useMemo(() => {
    return Object.keys(daysMap).filter((d) => d.startsWith(`${selectedYear}-`)).length;
  }, [daysMap, selectedYear]);

  const handleMouseEnter = (day, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
    setHoveredDay(day);
  };

  const handleMouseLeave = () => {
    setHoveredDay(null);
  };

  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-[#111726] border border-[#24304d] rounded-2xl p-6 shadow-xl shadow-black/20">
      {/* Header with title, stats, and year navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-semibold text-white tracking-tight">
              Consistency Calendar
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              {totalLoggedThisYear} days logged in {selectedYear}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            "Consistency over perfection." Click any square to view or log that day.
          </p>
        </div>

        {/* Year Selector / Navigation */}
        <div className="flex items-center space-x-2">
          {availableYears.length > 1 && (
            <div className="flex items-center space-x-1 bg-[#161e31] p-1 rounded-xl border border-[#24304d]">
              <button
                onClick={() => onYearChange(selectedYear - 1)}
                disabled={!availableYears.includes(selectedYear - 1)}
                className="p-1 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 hover:bg-[#1f2a44] transition-colors"
                title="Previous Year"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <select
                value={selectedYear}
                onChange={(e) => onYearChange(Number(e.target.value))}
                className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none px-2 py-0.5 cursor-pointer"
              >
                {availableYears.map((yr) => (
                  <option key={yr} value={yr} className="bg-[#111726] text-white">
                    {yr}
                  </option>
                ))}
              </select>
              <button
                onClick={() => onYearChange(selectedYear + 1)}
                disabled={!availableYears.includes(selectedYear + 1)}
                className="p-1 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 hover:bg-[#1f2a44] transition-colors"
                title="Next Year"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Heatmap Grid Container - Horizontally scrollable */}
      <div className="overflow-x-auto pb-4 scrollbar-thin">
        <div className="inline-block min-w-full">
          {/* Month labels row */}
          <div className="flex text-[11px] text-slate-400 mb-2 pl-9">
            {monthLabels.map((lbl, idx) => (
              <div
                key={idx}
                style={{
                  width: `${(weeks.length / 12) * 14.5}px`,
                  minWidth: '38px',
                }}
                className="font-medium truncate"
              >
                {lbl.monthName}
              </div>
            ))}
          </div>

          <div className="flex items-start">
            {/* Weekday indicators (Mon, Wed, Fri) */}
            <div className="flex flex-col justify-between text-[10px] text-slate-400 pr-2 pt-0.5 h-[105px] font-medium select-none">
              <span className="h-[12px] leading-[12px]">Sun</span>
              <span className="h-[12px] leading-[12px]">Tue</span>
              <span className="h-[12px] leading-[12px]">Thu</span>
              <span className="h-[12px] leading-[12px]">Sat</span>
            </div>

            {/* Weeks Columns */}
            <div className="flex gap-[3.5px]">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-[3.5px]">
                  {week.map((day) => {
                    const entry = daysMap[day.date];
                    const isTracked = !!entry;
                    const isToday = day.date === new Date().toISOString().slice(0, 10);

                    // Dynamic emerald styling for tracked days
                    let squareBg = 'bg-[#182032] border-[#24304d]/40'; // Untracked dark surface
                    if (isTracked) {
                      // Emerald green variations based on calorie intake or logged status
                      squareBg = 'bg-emerald-500 border-emerald-400/80 hover:bg-emerald-400 shadow-sm shadow-emerald-500/20';
                    }

                    if (!day.isCurrentYear) {
                      squareBg = 'bg-[#0f1420]/30 border-transparent opacity-20 pointer-events-none';
                    }

                    return (
                      <button
                        key={day.date}
                        type="button"
                        onClick={() => day.isCurrentYear && onDayClick && onDayClick(day.date, entry)}
                        onMouseEnter={(e) => day.isCurrentYear && handleMouseEnter({ ...day, entry }, e)}
                        onMouseLeave={handleMouseLeave}
                        className={`w-[12px] h-[12px] rounded-[2.5px] border transition-transform duration-100 hover:scale-125 focus:outline-none ${squareBg} ${
                          isToday ? 'ring-2 ring-emerald-400 ring-offset-1 ring-offset-[#111726]' : ''
                        }`}
                        aria-label={`${day.date}: ${isTracked ? 'Logged' : 'No entry'}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend and guidance footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-6 pt-4 border-t border-[#24304d]/60 text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>Hover or tap any square to view calorie details or edit an entry.</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-slate-400">Untracked</span>
              <div className="w-[12px] h-[12px] rounded-[2.5px] bg-[#182032] border border-[#24304d]/50" />
              <div className="w-[12px] h-[12px] rounded-[2.5px] bg-emerald-500 border border-emerald-400 shadow-sm shadow-emerald-500/30" />
              <span className="text-[11px] text-emerald-400 font-medium">Logged & Consistent</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Tooltip */}
      {hoveredDay && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 tooltip-animate"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y - 8}px`,
          }}
        >
          <div className="bg-[#0b101c] border border-emerald-500/30 shadow-2xl rounded-xl p-3 text-xs w-48 text-slate-200">
            <p className="font-semibold text-white mb-1">
              {formatDisplayDate(hoveredDay.date, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </p>

            {hoveredDay.entry ? (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-emerald-400 font-mono font-medium">
                  <span>Range:</span>
                  <span>{hoveredDay.entry.minCalories} – {hoveredDay.entry.maxCalories} kcal</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Midpoint:</span>
                  <span className="text-white font-mono font-medium">{hoveredDay.entry.midpointCalories} kcal</span>
                </div>
                {hoveredDay.entry.notes && (
                  <p className="text-[11px] text-slate-400 italic border-t border-[#24304d] pt-1 mt-1 truncate">
                    "{hoveredDay.entry.notes}"
                  </p>
                )}
                <div className="text-[10px] text-emerald-400/80 font-medium mt-1">
                  ✓ Click to edit entry
                </div>
              </div>
            ) : (
              <div>
                <p className="text-slate-400">No calorie entry logged</p>
                <p className="text-[10px] text-slate-400 mt-1">Click to log for this day</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
