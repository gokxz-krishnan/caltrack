/**
 * Get date string (YYYY-MM-DD) for a given Date
 */
export const formatDateKey = (date = new Date()) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format date for friendly human display (e.g. "Nov 13, 2026" or "Friday, Nov 13, 2026")
 */
export const formatDisplayDate = (dateStr, options = { month: 'short', day: 'numeric', year: 'numeric' }) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', options);
};

/**
 * Build the full year weeks grid for GitHub-style contribution calendar
 * Year: number (e.g. 2026)
 * Returns: { weeks, monthLabels }
 */
export const generateCalendarYearGrid = (year) => {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  // We want rows: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  // Find Sunday on or preceding Jan 1
  const startDayOfWeek = startDate.getDay();
  const calendarStart = new Date(startDate);
  calendarStart.setDate(startDate.getDate() - startDayOfWeek);

  const weeks = [];
  let currentWeek = [];
  const monthLabels = [];
  let lastLabeledMonth = -1;

  let curr = new Date(calendarStart);

  while (curr <= endDate || curr.getDay() !== 0) {
    const dateStr = formatDateKey(curr);
    const isCurrentYear = curr.getFullYear() === year;
    const dayOfWeek = curr.getDay();
    const month = curr.getMonth();

    // Check if we should place a month label for this week
    if (dayOfWeek === 0 && isCurrentYear && month !== lastLabeledMonth) {
      monthLabels.push({
        monthName: curr.toLocaleString('en-US', { month: 'short' }),
        weekIndex: weeks.length,
      });
      lastLabeledMonth = month;
    }

    currentWeek.push({
      date: dateStr,
      dayOfWeek,
      isCurrentYear,
      dayOfMonth: curr.getDate(),
      month: curr.getMonth(),
      year: curr.getFullYear(),
    });

    if (dayOfWeek === 6) {
      weeks.push(currentWeek);
      currentWeek = [];
    }

    curr.setDate(curr.getDate() + 1);
  }

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return { weeks, monthLabels };
};
