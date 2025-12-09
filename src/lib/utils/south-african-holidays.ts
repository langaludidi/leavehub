/**
 * South African Public Holidays Calculator
 * Includes all fixed and movable public holidays according to the Public Holidays Act, 1994
 */

import { addDays, getDay, isWeekend, startOfYear, endOfYear, format } from 'date-fns';

export interface PublicHoliday {
  date: Date;
  name: string;
  type: 'fixed' | 'movable';
  observedDate?: Date; // If holiday falls on Sunday, observed on Monday
}

/**
 * Calculate Easter Sunday for a given year using the Anonymous Gregorian algorithm
 */
function calculateEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(year, month - 1, day);
}

/**
 * Get Good Friday date for a given year (2 days before Easter Sunday)
 */
function getGoodFriday(year: number): Date {
  const easterSunday = calculateEasterSunday(year);
  return addDays(easterSunday, -2);
}

/**
 * Get Family Day date for a given year (Monday after Easter Sunday)
 */
function getFamilyDay(year: number): Date {
  const easterSunday = calculateEasterSunday(year);
  return addDays(easterSunday, 1);
}

/**
 * If a holiday falls on a Sunday, it's observed on the following Monday
 */
function getObservedDate(date: Date): Date {
  if (getDay(date) === 0) { // Sunday
    return addDays(date, 1);
  }
  return date;
}

/**
 * Get all South African public holidays for a given year
 */
export function getSouthAfricanHolidays(year: number): PublicHoliday[] {
  const holidays: PublicHoliday[] = [
    // Fixed holidays
    {
      date: new Date(year, 0, 1), // January 1
      name: "New Year's Day",
      type: 'fixed',
    },
    {
      date: new Date(year, 2, 21), // March 21
      name: 'Human Rights Day',
      type: 'fixed',
    },
    {
      date: new Date(year, 3, 27), // April 27
      name: 'Freedom Day',
      type: 'fixed',
    },
    {
      date: new Date(year, 4, 1), // May 1
      name: "Workers' Day",
      type: 'fixed',
    },
    {
      date: new Date(year, 5, 16), // June 16
      name: 'Youth Day',
      type: 'fixed',
    },
    {
      date: new Date(year, 7, 9), // August 9
      name: "National Women's Day",
      type: 'fixed',
    },
    {
      date: new Date(year, 8, 24), // September 24
      name: 'Heritage Day',
      type: 'fixed',
    },
    {
      date: new Date(year, 11, 16), // December 16
      name: 'Day of Reconciliation',
      type: 'fixed',
    },
    {
      date: new Date(year, 11, 25), // December 25
      name: 'Christmas Day',
      type: 'fixed',
    },
    {
      date: new Date(year, 11, 26), // December 26
      name: 'Day of Goodwill',
      type: 'fixed',
    },

    // Movable holidays (Easter-dependent)
    {
      date: getGoodFriday(year),
      name: 'Good Friday',
      type: 'movable',
    },
    {
      date: getFamilyDay(year),
      name: 'Family Day',
      type: 'movable',
    },
  ];

  // Add observed dates for holidays falling on Sunday
  return holidays.map(holiday => {
    const observedDate = getObservedDate(holiday.date);
    return {
      ...holiday,
      observedDate: observedDate.getTime() !== holiday.date.getTime() ? observedDate : undefined,
    };
  });
}

/**
 * Check if a given date is a South African public holiday
 */
export function isPublicHoliday(date: Date): boolean {
  const year = date.getFullYear();
  const holidays = getSouthAfricanHolidays(year);
  const dateString = format(date, 'yyyy-MM-dd');

  return holidays.some(holiday => {
    const holidayDateString = format(holiday.date, 'yyyy-MM-dd');
    const observedDateString = holiday.observedDate ? format(holiday.observedDate, 'yyyy-MM-dd') : null;

    return holidayDateString === dateString || observedDateString === dateString;
  });
}

/**
 * Get the holiday name for a given date (if it is a holiday)
 */
export function getHolidayName(date: Date): string | null {
  const year = date.getFullYear();
  const holidays = getSouthAfricanHolidays(year);
  const dateString = format(date, 'yyyy-MM-dd');

  const holiday = holidays.find(h => {
    const holidayDateString = format(h.date, 'yyyy-MM-dd');
    const observedDateString = h.observedDate ? format(h.observedDate, 'yyyy-MM-dd') : null;

    return holidayDateString === dateString || observedDateString === dateString;
  });

  return holiday ? holiday.name : null;
}

/**
 * Calculate working days between two dates (excluding weekends and public holidays)
 */
export function calculateWorkingDays(startDate: Date, endDate: Date): number {
  let count = 0;
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    // Check if it's not a weekend and not a public holiday
    if (!isWeekend(currentDate) && !isPublicHoliday(currentDate)) {
      count++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return count;
}

/**
 * Get all working days between two dates (excluding weekends and public holidays)
 */
export function getWorkingDays(startDate: Date, endDate: Date): Date[] {
  const workingDays: Date[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    // Check if it's not a weekend and not a public holiday
    if (!isWeekend(currentDate) && !isPublicHoliday(currentDate)) {
      workingDays.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return workingDays;
}

/**
 * Get all public holidays between two dates
 */
export function getHolidaysInRange(startDate: Date, endDate: Date): PublicHoliday[] {
  const holidays: PublicHoliday[] = [];
  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();

  // Get holidays for all years in the range
  for (let year = startYear; year <= endYear; year++) {
    const yearHolidays = getSouthAfricanHolidays(year);
    holidays.push(...yearHolidays);
  }

  // Filter to only holidays in the date range
  return holidays.filter(holiday => {
    const checkDate = holiday.observedDate || holiday.date;
    return checkDate >= startDate && checkDate <= endDate;
  });
}

/**
 * Get the next public holiday from a given date
 */
export function getNextPublicHoliday(fromDate: Date = new Date()): PublicHoliday | null {
  const year = fromDate.getFullYear();
  const holidays = [
    ...getSouthAfricanHolidays(year),
    ...getSouthAfricanHolidays(year + 1), // Include next year's holidays
  ];

  const futureHolidays = holidays
    .filter(holiday => {
      const checkDate = holiday.observedDate || holiday.date;
      return checkDate > fromDate;
    })
    .sort((a, b) => {
      const dateA = a.observedDate || a.date;
      const dateB = b.observedDate || b.date;
      return dateA.getTime() - dateB.getTime();
    });

  return futureHolidays.length > 0 ? futureHolidays[0] : null;
}

/**
 * Check if a date range contains any public holidays
 */
export function hasPublicHolidays(startDate: Date, endDate: Date): boolean {
  return getHolidaysInRange(startDate, endDate).length > 0;
}

/**
 * Get a formatted list of holidays for display
 */
export function getHolidaysList(year: number): string[] {
  const holidays = getSouthAfricanHolidays(year);

  return holidays.map(holiday => {
    const dateStr = format(holiday.date, 'dd MMM yyyy');
    const observedStr = holiday.observedDate
      ? ` (observed ${format(holiday.observedDate, 'dd MMM yyyy')})`
      : '';

    return `${holiday.name}: ${dateStr}${observedStr}`;
  });
}
