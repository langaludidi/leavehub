import { supabase } from './supabase';

export interface SouthAfricanHoliday {
  name: string;
  date: string; // ISO date string
  type: 'fixed' | 'variable' | 'observed';
  description?: string;
  observed_date?: string; // If different from actual date due to weekend rules
}

// South African public holidays as per Public Holidays Act 36 of 1994
export const SA_PUBLIC_HOLIDAYS_2025: SouthAfricanHoliday[] = [
  {
    name: "New Year's Day",
    date: "2025-01-01",
    type: "fixed",
    description: "New Year's Day - Public Holiday Act"
  },
  {
    name: "Human Rights Day",
    date: "2025-03-21",
    type: "fixed", 
    description: "Human Rights Day - Commemorates the Sharpeville Massacre"
  },
  {
    name: "Good Friday",
    date: "2025-04-18",
    type: "variable",
    description: "Good Friday - Christian holiday (variable date)"
  },
  {
    name: "Family Day",
    date: "2025-04-21",
    type: "variable",
    description: "Family Day - Monday after Easter Sunday"
  },
  {
    name: "Freedom Day",
    date: "2025-04-27",
    type: "fixed",
    description: "Freedom Day - Commemorates first democratic elections in 1994"
  },
  {
    name: "Workers' Day",
    date: "2025-05-01",
    type: "fixed",
    description: "Workers' Day - International Labour Day"
  },
  {
    name: "Youth Day",
    date: "2025-06-16", 
    type: "fixed",
    description: "Youth Day - Commemorates the Soweto Uprising of 1976"
  },
  {
    name: "National Women's Day",
    date: "2025-08-09",
    type: "fixed",
    description: "National Women's Day - Commemorates the 1956 women's march"
  },
  {
    name: "Heritage Day",
    date: "2025-09-24",
    type: "fixed", 
    description: "Heritage Day - Celebrates South African culture and diversity"
  },
  {
    name: "Day of Reconciliation", 
    date: "2025-12-16",
    type: "fixed",
    description: "Day of Reconciliation - Promotes reconciliation and national unity"
  },
  {
    name: "Christmas Day",
    date: "2025-12-25",
    type: "fixed",
    description: "Christmas Day - Christian holiday"
  },
  {
    name: "Day of Goodwill",
    date: "2025-12-26", 
    type: "fixed",
    description: "Day of Goodwill - Boxing Day"
  }
];

export const SA_PUBLIC_HOLIDAYS_2026: SouthAfricanHoliday[] = [
  {
    name: "New Year's Day",
    date: "2026-01-01",
    type: "fixed"
  },
  {
    name: "Human Rights Day", 
    date: "2026-03-21",
    type: "fixed"
  },
  {
    name: "Good Friday",
    date: "2026-04-03",
    type: "variable"
  },
  {
    name: "Family Day",
    date: "2026-04-06", 
    type: "variable"
  },
  {
    name: "Freedom Day",
    date: "2026-04-27",
    type: "fixed"
  },
  {
    name: "Workers' Day",
    date: "2026-05-01",
    type: "fixed"
  },
  {
    name: "Youth Day",
    date: "2026-06-16",
    type: "fixed"
  },
  {
    name: "National Women's Day",
    date: "2026-08-09",
    type: "fixed"
  },
  {
    name: "Heritage Day",
    date: "2026-09-24", 
    type: "fixed"
  },
  {
    name: "Day of Reconciliation",
    date: "2026-12-16",
    type: "fixed"
  },
  {
    name: "Christmas Day",
    date: "2026-12-25",
    type: "fixed"
  },
  {
    name: "Day of Goodwill",
    date: "2026-12-26",
    type: "fixed"
  }
];

// Function to calculate Easter dates (used for Good Friday and Family Day)
function calculateEaster(year: number): Date {
  // Using the algorithm for calculating Easter Sunday
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

// Generate holidays for a specific year
export function generateSAHolidaysForYear(year: number): SouthAfricanHoliday[] {
  const easter = calculateEaster(year);
  const goodFriday = new Date(easter);
  goodFriday.setDate(easter.getDate() - 2);
  
  const familyDay = new Date(easter);
  familyDay.setDate(easter.getDate() + 1);

  const holidays: SouthAfricanHoliday[] = [
    {
      name: "New Year's Day",
      date: `${year}-01-01`,
      type: "fixed",
      description: "New Year's Day - Public Holiday Act"
    },
    {
      name: "Human Rights Day",
      date: `${year}-03-21`,
      type: "fixed",
      description: "Human Rights Day - Commemorates the Sharpeville Massacre"
    },
    {
      name: "Good Friday",
      date: goodFriday.toISOString().split('T')[0],
      type: "variable",
      description: "Good Friday - Christian holiday (variable date)"
    },
    {
      name: "Family Day",
      date: familyDay.toISOString().split('T')[0],
      type: "variable", 
      description: "Family Day - Monday after Easter Sunday"
    },
    {
      name: "Freedom Day",
      date: `${year}-04-27`,
      type: "fixed",
      description: "Freedom Day - Commemorates first democratic elections in 1994"
    },
    {
      name: "Workers' Day",
      date: `${year}-05-01`,
      type: "fixed",
      description: "Workers' Day - International Labour Day"
    },
    {
      name: "Youth Day",
      date: `${year}-06-16`,
      type: "fixed",
      description: "Youth Day - Commemorates the Soweto Uprising of 1976"
    },
    {
      name: "National Women's Day",
      date: `${year}-08-09`,
      type: "fixed",
      description: "National Women's Day - Commemorates the 1956 women's march"
    },
    {
      name: "Heritage Day",
      date: `${year}-09-24`,
      type: "fixed",
      description: "Heritage Day - Celebrates South African culture and diversity"
    },
    {
      name: "Day of Reconciliation",
      date: `${year}-12-16`,
      type: "fixed",
      description: "Day of Reconciliation - Promotes reconciliation and national unity"
    },
    {
      name: "Christmas Day",
      date: `${year}-12-25`,
      type: "fixed",
      description: "Christmas Day - Christian holiday"
    },
    {
      name: "Day of Goodwill", 
      date: `${year}-12-26`,
      type: "fixed",
      description: "Day of Goodwill - Boxing Day"
    }
  ];

  // Apply weekend substitution rules (if holiday falls on Sunday, it's observed on Monday)
  return holidays.map(holiday => {
    const holidayDate = new Date(holiday.date);
    const dayOfWeek = holidayDate.getDay();
    
    if (dayOfWeek === 0) { // Sunday
      const observedDate = new Date(holidayDate);
      observedDate.setDate(holidayDate.getDate() + 1);
      return {
        ...holiday,
        observed_date: observedDate.toISOString().split('T')[0]
      };
    }
    
    return holiday;
  });
}

// Check if a date is a South African public holiday
export function isSAPublicHoliday(date: string | Date): boolean {
  const checkDate = typeof date === 'string' ? date : date.toISOString().split('T')[0];
  const year = new Date(checkDate).getFullYear();
  const holidays = generateSAHolidaysForYear(year);
  
  return holidays.some(holiday => 
    holiday.date === checkDate || holiday.observed_date === checkDate
  );
}

// Get public holiday info for a specific date
export function getSAPublicHoliday(date: string | Date): SouthAfricanHoliday | null {
  const checkDate = typeof date === 'string' ? date : date.toISOString().split('T')[0];
  const year = new Date(checkDate).getFullYear();
  const holidays = generateSAHolidaysForYear(year);
  
  return holidays.find(holiday => 
    holiday.date === checkDate || holiday.observed_date === checkDate
  ) || null;
}

// Calculate working days between two dates (excluding weekends and SA public holidays)
export function calculateWorkingDaysSA(startDate: string | Date, endDate: string | Date): number {
  const start = new Date(typeof startDate === 'string' ? startDate : startDate);
  const end = new Date(typeof endDate === 'string' ? endDate : endDate);
  
  let workingDays = 0;
  const currentDate = new Date(start);
  
  while (currentDate <= end) {
    const dayOfWeek = currentDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
    const isHoliday = isSAPublicHoliday(currentDate);
    
    if (!isWeekend && !isHoliday) {
      workingDays++;
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return workingDays;
}

// Supabase functions for managing holidays in the database
export class SAHolidayManager {
  static async importHolidaysForYear(organizationId: string, year: number): Promise<boolean> {
    try {
      const holidays = generateSAHolidaysForYear(year);
      
      // Delete existing holidays for this year and organization
      await supabase
        .from('company_holidays')
        .delete()
        .eq('organization_id', organizationId)
        .gte('holiday_date', `${year}-01-01`)
        .lt('holiday_date', `${year + 1}-01-01`);

      // Insert new holidays
      const holidayRecords = holidays.map(holiday => ({
        organization_id: organizationId,
        name: holiday.name,
        holiday_date: holiday.observed_date || holiday.date,
        actual_date: holiday.date,
        is_recurring: holiday.type === 'fixed',
        holiday_type: 'public',
        country: 'ZA',
        description: holiday.description,
        created_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('company_holidays')
        .insert(holidayRecords);

      if (error) {
        console.error('Error importing SA holidays:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in importHolidaysForYear:', error);
      return false;
    }
  }

  static async getOrganizationHolidays(organizationId: string, year?: number): Promise<any[]> {
    try {
      let query = supabase
        .from('company_holidays')
        .select('*')
        .eq('organization_id', organizationId)
        .order('holiday_date');

      if (year) {
        query = query
          .gte('holiday_date', `${year}-01-01`)
          .lt('holiday_date', `${year + 1}-01-01`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching holidays:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getOrganizationHolidays:', error);
      return [];
    }
  }

  static async autoImportCurrentAndNextYear(organizationId: string): Promise<boolean> {
    const currentYear = new Date().getFullYear();
    
    const currentYearSuccess = await this.importHolidaysForYear(organizationId, currentYear);
    const nextYearSuccess = await this.importHolidaysForYear(organizationId, currentYear + 1);
    
    return currentYearSuccess && nextYearSuccess;
  }

  static async isWorkingDay(date: string | Date, organizationId: string): Promise<boolean> {
    const checkDate = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    const dateObj = new Date(checkDate);
    
    // Check if weekend
    const dayOfWeek = dateObj.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return false;
    
    // Check if public holiday
    const { data } = await supabase
      .from('company_holidays')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('holiday_date', checkDate)
      .single();
    
    return !data; // Working day if no holiday found
  }
}