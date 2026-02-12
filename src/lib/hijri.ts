export interface HijriDate {
  day: number;
  month: number;
  monthName: string;
  year: number;
  formatted: string;
}

const HIJRI_MONTHS = [
  'Muharram',
  'Safar',
  'Rabi al-Awwal',
  'Rabi al-Thani',
  'Jumada al-Awwal',
  'Jumada al-Thani',
  'Rajab',
  'Shaban',
  'Ramadan',
  'Shawwal',
  'Dhul Qadah',
  'Dhul Hijjah'
];

export interface SpecialDay {
  hijriMonth: number;
  hijriDay: number;
  name: string;
  description: string;
}

export const SPECIAL_ISLAMIC_DAYS: SpecialDay[] = [
  { hijriMonth: 1, hijriDay: 1, name: 'Islamic New Year', description: 'Beginning of the Hijri year' },
  { hijriMonth: 1, hijriDay: 10, name: 'Day of Ashura', description: 'Recommended to fast' },
  { hijriMonth: 3, hijriDay: 12, name: 'Mawlid al-Nabi', description: 'Birth of the Prophet ﷺ' },
  { hijriMonth: 7, hijriDay: 27, name: 'Isra and Miraj', description: 'Night Journey of the Prophet ﷺ' },
  { hijriMonth: 8, hijriDay: 15, name: 'Laylat al-Baraah', description: 'Night of Salvation' },
  { hijriMonth: 9, hijriDay: 1, name: 'Beginning of Ramadan', description: 'Holy month of fasting begins' },
  { hijriMonth: 9, hijriDay: 27, name: 'Laylat al-Qadr', description: 'Night of Power (approximate)' },
  { hijriMonth: 10, hijriDay: 1, name: 'Eid al-Fitr', description: 'Festival of Breaking Fast' },
  { hijriMonth: 12, hijriDay: 8, name: 'Day of Tarwiyah', description: 'Beginning of Hajj' },
  { hijriMonth: 12, hijriDay: 9, name: 'Day of Arafah', description: 'Recommended to fast' },
  { hijriMonth: 12, hijriDay: 10, name: 'Eid al-Adha', description: 'Festival of Sacrifice' },
];

export function gregorianToHijri(date: Date): HijriDate {
  const jd = gregorianToJD(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return jdToHijri(jd);
}

function gregorianToJD(year: number, month: number, day: number): number {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
}

function jdToHijri(jd: number): HijriDate {
  const l = Math.floor(jd - 1948439.5) + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) + Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const month = Math.floor((24 * l3) / 709);
  const day = l3 - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;

  const monthName = HIJRI_MONTHS[month - 1] || 'Unknown';

  return {
    day,
    month,
    monthName,
    year,
    formatted: `${day} ${monthName} ${year} AH`
  };
}

export function getSpecialDay(hijriDate: HijriDate): SpecialDay | undefined {
  return SPECIAL_ISLAMIC_DAYS.find(
    day => day.hijriMonth === hijriDate.month && day.hijriDay === hijriDate.day
  );
}

export function getUpcomingSpecialDays(hijriDate: HijriDate, count: number = 3): Array<SpecialDay & { daysUntil: number }> {
  const upcoming: Array<SpecialDay & { daysUntil: number }> = [];
  
  for (const specialDay of SPECIAL_ISLAMIC_DAYS) {
    let daysUntil = calculateDaysUntil(hijriDate, specialDay.hijriMonth, specialDay.hijriDay);
    
    if (daysUntil >= 0) {
      upcoming.push({ ...specialDay, daysUntil });
    }
    
    if (upcoming.length >= count) break;
  }
  
  if (upcoming.length < count) {
    for (const specialDay of SPECIAL_ISLAMIC_DAYS) {
      let daysUntil = calculateDaysUntil(hijriDate, specialDay.hijriMonth, specialDay.hijriDay, true);
      
      if (daysUntil >= 0) {
        upcoming.push({ ...specialDay, daysUntil });
      }
      
      if (upcoming.length >= count) break;
    }
  }
  
  return upcoming.sort((a, b) => a.daysUntil - b.daysUntil).slice(0, count);
}

function calculateDaysUntil(current: HijriDate, targetMonth: number, targetDay: number, nextYear: boolean = false): number {
  const currentDayOfYear = getDayOfYear(current.month, current.day);
  let targetDayOfYear = getDayOfYear(targetMonth, targetDay);
  
  if (nextYear) {
    targetDayOfYear += 354;
  }
  
  return targetDayOfYear - currentDayOfYear;
}

function getDayOfYear(month: number, day: number): number {
  const daysInMonths = [0, 30, 59, 89, 118, 148, 177, 207, 236, 266, 296, 325];
  return (daysInMonths[month - 1] || 0) + day;
}
