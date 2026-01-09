/**
 * Consistent date formatting utility to prevent hydration mismatches
 * Uses UTC methods to ensure server/client consistency
 */
export function formatExhibitionDate(
  startDate?: string, 
  endDate?: string, 
  isOneDayEvent?: boolean
): string {
  if (!startDate) return "";
  
  // Parse dates consistently using UTC to avoid timezone issues
  const start = new Date(startDate + 'T00:00:00.000Z');
  const end = endDate ? new Date(endDate + 'T00:00:00.000Z') : null;
  
  // Check if start date is valid
  if (isNaN(start.getTime())) {
    console.warn('Invalid start date:', startDate);
    return startDate;
  }
  
  // Check if end date is valid
  if (end && isNaN(end.getTime())) {
    console.warn('Invalid end date:', endDate);
    return startDate;
  }
  
  // Always use full year (4 digits) for consistency
  if (isOneDayEvent) {
    return `${start.getUTCDate()}. ${start.getUTCMonth() + 1}. ${start.getUTCFullYear()}`;
  }
  
  if (end) {
    const startDay = start.getUTCDate();
    const startMonth = start.getUTCMonth() + 1;
    const endDay = end.getUTCDate();
    const endMonth = end.getUTCMonth() + 1;
    const endYear = end.getUTCFullYear();

    if (startMonth === endMonth) {
      return `${startDay}. - ${endDay}. ${endMonth}. ${endYear}`;
    } else {
      return `${startDay}. ${startMonth}. - ${endDay}. ${endMonth}. ${endYear}`;
    }
  }
  
  // Single date fallback
  return `${start.getUTCDate()}. ${start.getUTCMonth() + 1}. ${start.getUTCFullYear()}`;
}

/**
 * Format upcoming exhibition date range with 4-digit years
 * Preserves the exact formatting style of the upcoming bar
 * Uses UTC methods to prevent hydration mismatches
 */
export function formatUpcomingRange(startDate?: string, endDate?: string): string {
  if (!startDate || !endDate) return "";
  
  const start = new Date(startDate + 'T00:00:00.000Z');
  const end = new Date(endDate + 'T00:00:00.000Z');
  
  // Check if dates are valid
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    console.warn('Invalid date range:', { startDate, endDate });
    return `${startDate} - ${endDate}`;
  }
  
  if (start.getUTCFullYear() === end.getUTCFullYear() && start.getUTCMonth() === end.getUTCMonth()) {
    return `${start.getUTCDate()}. - ${end.getUTCDate()}. ${end.getUTCMonth() + 1}. ${end.getUTCFullYear()}`;
  } else {
    return `${start.getUTCDate()}. ${start.getUTCMonth() + 1}. ${start.getUTCFullYear()} - ${end.getUTCDate()}. ${end.getUTCMonth() + 1}. ${end.getUTCFullYear()}`;
  }
}

/**
 * Format vernissage date with 4-digit year
 * Preserves the exact formatting style of the upcoming bar
 * Uses local time methods to avoid timezone conversion issues
 */
export function formatUpcomingVernissage(vernissageDate?: string): string {
  if (!vernissageDate) return "";
  
  // Handle different date formats from Sanity
  let date: Date;
  if (vernissageDate.includes('T')) {
    // Already has time component - parse as local time
    date = new Date(vernissageDate);
  } else {
    // Just date, add default time
    date = new Date(vernissageDate + 'T18:00:00');
  }
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    console.warn('Invalid vernissage date:', vernissageDate);
    return `vernisáž: ${vernissageDate}`;
  }
  
  const pad = (n: number) => n < 10 ? "0" + n : n;
  
  return `vernisáž: ${date.getDate()}. ${date.getMonth() + 1}. ${date.getFullYear()} v ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * Format program event date (UTC-safe, matches Program section formatting)
 */
export function formatProgramEventDate(isoDate?: string) {
  if (!isoDate) return "";
  const d = new Date(isoDate + "T00:00:00.000Z");
  if (Number.isNaN(d.getTime())) return isoDate;
  return `${d.getUTCDate()}. ${d.getUTCMonth() + 1}. ${d.getUTCFullYear()}`;
}

/**
 * Format Czech weekday short code from ISO date (UTC-safe)
 */
export function formatCzWeekdayShort(isoDate?: string) {
  if (!isoDate) return "";
  const d = new Date(isoDate + "T00:00:00.000Z");
  if (Number.isNaN(d.getTime())) return "";
  const day = d.getUTCDay(); // 0..6 (Sun..Sat)
  const map: Record<number, string> = {
    0: "NE",
    1: "PO",
    2: "ÚT",
    3: "ST",
    4: "ČT",
    5: "PÁ",
    6: "SO",
  };
  return map[day] ?? "";
}

/**
 * Format Czech long date from ISO date (UTC-safe).
 * Example: "12. ledna 2026"
 */
export function formatCzDateLong(isoDate?: string) {
  if (!isoDate) return "";
  const d = new Date(isoDate + "T00:00:00.000Z");
  if (Number.isNaN(d.getTime())) return isoDate;

  const monthsGenitive = [
    "ledna",
    "února",
    "března",
    "dubna",
    "května",
    "června",
    "července",
    "srpna",
    "září",
    "října",
    "listopadu",
    "prosince",
  ];
  const m = monthsGenitive[d.getUTCMonth()] ?? String(d.getUTCMonth() + 1);
  return `${d.getUTCDate()}. ${m} ${d.getUTCFullYear()}`;
}

/**
 * Format Czech full weekday name from ISO date (UTC-safe).
 * Example: "pondělí"
 */
export function formatCzWeekdayLong(isoDate?: string) {
  if (!isoDate) return "";
  const d = new Date(isoDate + "T00:00:00.000Z");
  if (Number.isNaN(d.getTime())) return "";
  const day = d.getUTCDay(); // 0..6 (Sun..Sat)
  const map: Record<number, string> = {
    0: "neděle",
    1: "pondělí",
    2: "úterý",
    3: "středa",
    4: "čtvrtek",
    5: "pátek",
    6: "sobota",
  };
  return map[day] ?? "";
}
