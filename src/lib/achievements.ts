export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'count' | 'goal' | 'time' | 'special';
  requirement: number;
  unlockedAt?: Date;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Count achievements
  {
    id: 'first_100',
    title: 'First Steps',
    description: 'Complete your first 100 counts',
    icon: '🌟',
    category: 'count',
    requirement: 100
  },
  {
    id: 'first_1000',
    title: 'Thousand Strong',
    description: 'Reach 1,000 total counts',
    icon: '✨',
    category: 'count',
    requirement: 1000
  },
  {
    id: 'first_10000',
    title: 'Ten Thousand',
    description: 'Reach 10,000 total counts',
    icon: '💫',
    category: 'count',
    requirement: 10000
  },
  {
    id: 'first_100000',
    title: 'Centurion',
    description: 'Reach 100,000 total counts',
    icon: '🏆',
    category: 'count',
    requirement: 100000
  },
  {
    id: 'first_million',
    title: 'Million Mubarak',
    description: 'Reach 1,000,000 total counts',
    icon: '👑',
    category: 'count',
    requirement: 1000000
  },

  // Streak achievements
  {
    id: 'streak_3',
    title: 'Consistent Start',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    category: 'streak',
    requirement: 3
  },
  {
    id: 'streak_7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '💎',
    category: 'streak',
    requirement: 7
  },
  {
    id: 'streak_30',
    title: 'Monthly Master',
    description: 'Maintain a 30-day streak',
    icon: '🌙',
    category: 'streak',
    requirement: 30
  },
  {
    id: 'streak_100',
    title: 'Century Streak',
    description: 'Maintain a 100-day streak',
    icon: '🌟',
    category: 'streak',
    requirement: 100
  },
  {
    id: 'streak_365',
    title: 'Year of Dhikr',
    description: 'Maintain a 365-day streak',
    icon: '🏅',
    category: 'streak',
    requirement: 365
  },

  // Goal achievements
  {
    id: 'first_goal',
    title: 'First Victory',
    description: 'Complete your first goal',
    icon: '🎯',
    category: 'goal',
    requirement: 1
  },
  {
    id: 'goals_5',
    title: 'Goal Getter',
    description: 'Complete 5 goals',
    icon: '🎖️',
    category: 'goal',
    requirement: 5
  },
  {
    id: 'goals_10',
    title: 'Determined Devotee',
    description: 'Complete 10 goals',
    icon: '⭐',
    category: 'goal',
    requirement: 10
  },
  {
    id: 'goals_50',
    title: 'Goal Guardian',
    description: 'Complete 50 goals',
    icon: '🏅',
    category: 'goal',
    requirement: 50
  },

  // Session achievements
  {
    id: 'session_100',
    title: 'Century Session',
    description: 'Complete 100 counts in one session',
    icon: '💯',
    category: 'count',
    requirement: 100
  },
  {
    id: 'session_1000',
    title: 'Marathon Dhikr',
    description: 'Complete 1,000 counts in one session',
    icon: '🏃',
    category: 'count',
    requirement: 1000
  },

  // Special achievements
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Count during Fajr time (before sunrise)',
    icon: '🌅',
    category: 'time',
    requirement: 1
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Count after Isha time',
    icon: '🦉',
    category: 'time',
    requirement: 1
  },
  {
    id: 'friday_dhikr',
    title: 'Friday Blessings',
    description: 'Count on a Friday',
    icon: '🕌',
    category: 'special',
    requirement: 1
  },
  {
    id: 'ramadan_dhikr',
    title: 'Ramadan Devotion',
    description: 'Count during Ramadan',
    icon: '🌙',
    category: 'special',
    requirement: 1
  },
  {
    id: 'eid_celebration',
    title: 'Eid Mubarak',
    description: 'Count on Eid day',
    icon: '🎉',
    category: 'special',
    requirement: 1
  }
];

export function checkAchievements(
  totalCount: number,
  currentStreak: number,
  completedGoals: number,
  sessionCount: number,
  timeOfDay: { isFajr: boolean; isAfterIsha: boolean; isFriday: boolean; isRamadan: boolean; isEid: boolean },
  unlockedIds: string[]
): Achievement[] {
  const newlyUnlocked: Achievement[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (unlockedIds.includes(achievement.id)) continue;

    let qualified = false;

    switch (achievement.category) {
      case 'count':
        if (achievement.id === 'session_100' || achievement.id === 'session_1000') {
          qualified = sessionCount >= achievement.requirement;
        } else {
          qualified = totalCount >= achievement.requirement;
        }
        break;
      case 'streak':
        qualified = currentStreak >= achievement.requirement;
        break;
      case 'goal':
        qualified = completedGoals >= achievement.requirement;
        break;
      case 'time':
        if (achievement.id === 'early_bird') qualified = timeOfDay.isFajr;
        if (achievement.id === 'night_owl') qualified = timeOfDay.isAfterIsha;
        break;
      case 'special':
        if (achievement.id === 'friday_dhikr') qualified = timeOfDay.isFriday;
        if (achievement.id === 'ramadan_dhikr') qualified = timeOfDay.isRamadan;
        if (achievement.id === 'eid_celebration') qualified = timeOfDay.isEid;
        break;
    }

    if (qualified) {
      newlyUnlocked.push({ ...achievement, unlockedAt: new Date() });
    }
  }

  return newlyUnlocked;
}
