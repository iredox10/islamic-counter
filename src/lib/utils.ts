import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { subDays, format, differenceInCalendarDays, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateStreak(dateStrings: string[]): { currentStreak: number; longestStreak: number } {
  if (dateStrings.length === 0) return { currentStreak: 0, longestStreak: 0 };

  const uniqueDates = [...new Set(dateStrings)].sort().reverse();
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  const hasTodayOrYesterday = uniqueDates[0] === today || uniqueDates[0] === yesterday;
  if (!hasTodayOrYesterday) return { currentStreak: 0, longestStreak: calculateLongestStreak(uniqueDates) };

  let currentStreak = 1;
  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const current = parseISO(uniqueDates[i]);
    const next = parseISO(uniqueDates[i + 1]);
    const diff = differenceInCalendarDays(current, next);
    
    if (diff === 1) {
      currentStreak++;
    } else {
      break;
    }
  }

  return { 
    currentStreak, 
    longestStreak: Math.max(currentStreak, calculateLongestStreak(uniqueDates)) 
  };
}

function calculateLongestStreak(sortedDates: string[]): number {
  if (sortedDates.length === 0) return 0;
  
  let longestStreak = 1;
  let currentStreak = 1;
  
  const dates = [...sortedDates].reverse();
  
  for (let i = 0; i < dates.length - 1; i++) {
    const current = parseISO(dates[i]);
    const next = parseISO(dates[i + 1]);
    const diff = differenceInCalendarDays(next, current);
    
    if (diff === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }
  
  return longestStreak;
}
