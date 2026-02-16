import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { format, subDays, subWeeks, startOfWeek, eachDayOfInterval } from 'date-fns';
import { 
  TrendingUp, Users, Target, Flame, BarChart3, 
  Activity, Calendar, MousePointer, Globe, Smartphone, 
  Monitor, Eye, Timer, AlertCircle, 
  RefreshCw
} from 'lucide-react';
import { cn } from '../lib/utils';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { PRAYERS } from '../lib/adhkar';
import { databases, DATABASE_ID, isAppwriteConfigured, ANALYTICS_SESSIONS_COLLECTION, ANALYTICS_EVENTS_COLLECTION } from '../lib/appwrite';
import { Query } from 'appwrite';

const COLORS = ['#d4af37', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

interface GlobalStats {
  totalUsers: number;
  activeUsersToday: number;
  activeUsersWeek: number;
  totalSessions: number;
  avgSessionDuration: number;
  totalCounts: number;
  totalPrayersCompleted: number;
  topPlatforms: { platform: string; count: number }[];
  topScreenSizes: { size: string; count: number }[];
  topTimezones: { timezone: string; count: number }[];
}

interface DailyMetrics {
  date: string;
  users: number;
  sessions: number;
  counts: number;
  avgDuration: number;
}

export function Admin() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [isLoading, setIsLoading] = useState(true);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetrics[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  const logs = useLiveQuery(() => db.logs.toArray(), []);
  const targets = useLiveQuery(() => db.targets.toArray(), []);
  const prayerCompletions = useLiveQuery(() => db.prayerCompletions.toArray(), []);

  useEffect(() => {
    if (isAppwriteConfigured()) {
      fetchGlobalAnalytics();
    } else {
      setIsLoading(false);
    }
  }, [timeRange]);

  async function fetchGlobalAnalytics() {
    setIsLoading(true);
    try {
      const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = subDays(new Date(), daysAgo);
      
      const [sessionsResult, eventsResult] = await Promise.all([
        databases.listDocuments(DATABASE_ID, ANALYTICS_SESSIONS_COLLECTION, [
          Query.greaterThan('startedAt', startDate.toISOString()),
          Query.limit(5000)
        ]),
        databases.listDocuments(DATABASE_ID, ANALYTICS_EVENTS_COLLECTION, [
          Query.greaterThan('timestamp', startDate.toISOString()),
          Query.limit(5000)
        ])
      ]);
      
      const sessions = sessionsResult.documents;
      const events = eventsResult.documents;
      
      const uniqueDevices = new Set(sessions.map(s => s.deviceId));
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const todayDevices = new Set(
        sessions.filter(s => s.startedAt?.startsWith(todayStr)).map(s => s.deviceId)
      );
      
      const weekStart = startOfWeek(new Date());
      const weekDevices = new Set(
        sessions.filter(s => new Date(s.startedAt) >= weekStart).map(s => s.deviceId)
      );
      
      const avgDuration = sessions.length > 0 
        ? sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length 
        : 0;
      
      const platformCounts: Record<string, number> = {};
      sessions.forEach(s => {
        if (s.platform) {
          platformCounts[s.platform] = (platformCounts[s.platform] || 0) + 1;
        }
      });
      
      const topPlatforms = Object.entries(platformCounts)
        .map(([platform, count]) => ({ platform, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      const screenSizeCounts: Record<string, number> = {};
      sessions.forEach(s => {
        if (s.screenSize) {
          const size = s.screenSize.split('x')[0];
          const bucket = parseInt(size) < 768 ? 'Mobile' : parseInt(size) < 1024 ? 'Tablet' : 'Desktop';
          screenSizeCounts[bucket] = (screenSizeCounts[bucket] || 0) + 1;
        }
      });
      
      const topScreenSizes = Object.entries(screenSizeCounts)
        .map(([size, count]) => ({ size, count }))
        .sort((a, b) => b.count - a.count);
      
      const timezoneCounts: Record<string, number> = {};
      sessions.forEach(s => {
        if (s.timezone) {
          timezoneCounts[s.timezone] = (timezoneCounts[s.timezone] || 0) + 1;
        }
      });
      
      const topTimezones = Object.entries(timezoneCounts)
        .map(([timezone, count]) => ({ timezone, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      const counterEvents = events.filter(e => e.type === 'counter_use');
      const prayerEvents = events.filter(e => e.type === 'prayer_complete');
      
      setGlobalStats({
        totalUsers: uniqueDevices.size,
        activeUsersToday: todayDevices.size,
        activeUsersWeek: weekDevices.size,
        totalSessions: sessions.length,
        avgSessionDuration: Math.round(avgDuration),
        totalCounts: counterEvents.length,
        totalPrayersCompleted: prayerEvents.length,
        topPlatforms,
        topScreenSizes,
        topTimezones
      });
      
      const dailyData: DailyMetrics[] = [];
      const dateRange = eachDayOfInterval({ start: startDate, end: new Date() });
      
      for (const date of dateRange) {
        const dateStr = format(date, 'yyyy-MM-dd');
        const daySessions = sessions.filter(s => s.startedAt?.startsWith(dateStr));
        const dayEvents = events.filter(e => e.timestamp?.startsWith(dateStr));
        
        dailyData.push({
          date: format(date, 'MMM dd'),
          users: new Set(daySessions.map(s => s.deviceId)).size,
          sessions: daySessions.length,
          counts: dayEvents.filter(e => e.type === 'counter_use').length,
          avgDuration: daySessions.length > 0 
            ? Math.round(daySessions.reduce((sum, s) => sum + (s.duration || 0), 0) / daySessions.length)
            : 0
        });
      }
      
      setDailyMetrics(dailyData);
      setLastUpdated(new Date());
    } catch (error) {
      console.warn('Failed to fetch global analytics:', error);
    }
    setIsLoading(false);
  }

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayLogs = logs?.filter(l => l.dateStr === today) || [];
  const todayCount = todayLogs.reduce((sum, l) => sum + l.count, 0);

  const startDate = subDays(new Date(), timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90);
  const filteredLogs = logs?.filter(l => new Date(l.timestamp) >= startDate) || [];
  
  const totalCount = filteredLogs.reduce((sum, l) => sum + l.count, 0);
  const lifetimeCount = logs?.reduce((sum, l) => sum + l.count, 0) || 0;
  
  const uniqueDays = new Set(filteredLogs.map(l => l.dateStr)).size;
  const avgPerDay = uniqueDays > 0 ? Math.round(totalCount / uniqueDays) : 0;
  
  const dailyCounts = filteredLogs.reduce((acc, l) => {
    acc[l.dateStr] = (acc[l.dateStr] || 0) + l.count;
    return acc;
  }, {} as Record<string, number>);
  const bestDay = Math.max(0, ...Object.values(dailyCounts));
  
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayLogs = logs?.filter(l => l.dateStr === dateStr) || [];
    return {
      date: format(date, 'EEE'),
      count: dayLogs.reduce((sum, l) => sum + l.count, 0)
    };
  });
  
  const hourlyData = Array.from({ length: 24 }).map((_, hour) => {
    const hourLogs = filteredLogs.filter(l => new Date(l.timestamp).getHours() === hour);
    return {
      hour: `${hour}:00`,
      count: hourLogs.reduce((sum, l) => sum + l.count, 0)
    };
  });
  
  const prayerStats = PRAYERS.map(prayer => {
    const completions = prayerCompletions?.filter(c => c.prayer === prayer.id) || [];
    const last7DaysCompletions = completions.filter(c => 
      new Date(c.completedAt) >= subDays(new Date(), 7)
    ).length;
    return {
      name: prayer.name,
      arabic: prayer.arabicName,
      completions: completions.length,
      last7Days: last7DaysCompletions
    };
  });
  
  const completedTargets = targets?.filter(t => t.status === 'completed').length || 0;
  const totalTargets = targets?.length || 0;
  const targetCompletionRate = totalTargets > 0 ? Math.round((completedTargets / totalTargets) * 100) : 0;
  
  const calculateCurrentStreak = () => {
    if (!logs || logs.length === 0) return 0;
    const dates = [...new Set(logs.map(l => l.dateStr))].sort().reverse();
    let streak = 0;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    
    for (let i = 0; i < dates.length; i++) {
      const expectedDate = format(subDays(new Date(), i), 'yyyy-MM-dd');
      if (dates.includes(expectedDate)) {
        streak++;
      } else if (expectedDate !== todayStr) {
        break;
      }
    }
    return streak;
  };
  
  const currentStreak = calculateCurrentStreak();
  
  const thisWeekCount = logs?.filter(l => 
    new Date(l.timestamp) >= subWeeks(new Date(), 1)
  ).reduce((sum, l) => sum + l.count, 0) || 0;
  
  const lastWeekCount = logs?.filter(l => {
    const date = new Date(l.timestamp);
    return date >= subWeeks(new Date(), 2) && date < subWeeks(new Date(), 1);
  }).reduce((sum, l) => sum + l.count, 0) || 0;

  const weeklyTrend = lastWeekCount > 0 
    ? Math.round(((thisWeekCount - lastWeekCount) / lastWeekCount) * 100)
    : 0;
  
  const peakHour = hourlyData.reduce((max, h) => h.count > max.count ? h : max, hourlyData[0]);

  function formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold-500/10">
              <BarChart3 size={28} className="text-gold-400" />
            </div>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl text-slate-100">Admin Dashboard</h1>
              <p className="text-slate-500 text-sm">App-wide analytics & metrics</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none focus:border-gold-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            
            <button
              onClick={fetchGlobalAnalytics}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:border-gold-500 transition-colors"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </header>

        {isAppwriteConfigured() && globalStats && (
          <section className="mb-8">
            <h2 className="text-lg font-medium text-slate-300 mb-4 flex items-center gap-2">
              <Globe size={18} className="text-gold-400" />
              Global Analytics
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="glass-panel p-4 rounded-xl">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Users size={14} />
                  Total Users
                </div>
                <p className="text-2xl font-serif text-gold-400">{globalStats.totalUsers.toLocaleString()}</p>
              </div>
              
              <div className="glass-panel p-4 rounded-xl">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Activity size={14} className="text-emerald-400" />
                  Active Today
                </div>
                <p className="text-2xl font-serif text-emerald-400">{globalStats.activeUsersToday.toLocaleString()}</p>
              </div>
              
              <div className="glass-panel p-4 rounded-xl">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Calendar size={14} className="text-blue-400" />
                  Active This Week
                </div>
                <p className="text-2xl font-serif text-blue-400">{globalStats.activeUsersWeek.toLocaleString()}</p>
              </div>
              
              <div className="glass-panel p-4 rounded-xl">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Timer size={14} className="text-purple-400" />
                  Avg Session
                </div>
                <p className="text-2xl font-serif text-purple-400">{formatDuration(globalStats.avgSessionDuration)}</p>
              </div>
              
              <div className="glass-panel p-4 rounded-xl">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <MousePointer size={14} className="text-pink-400" />
                  Total Counts
                </div>
                <p className="text-2xl font-serif text-pink-400">{globalStats.totalCounts.toLocaleString()}</p>
              </div>
              
              <div className="glass-panel p-4 rounded-xl">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Target size={14} className="text-orange-400" />
                  Prayers Done
                </div>
                <p className="text-2xl font-serif text-orange-400">{globalStats.totalPrayersCompleted.toLocaleString()}</p>
              </div>
            </div>
          </section>
        )}

        {isAppwriteConfigured() && dailyMetrics.length > 0 && (
          <section className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="glass-panel p-4 rounded-xl">
                <h3 className="text-sm font-medium text-slate-300 mb-4">Daily Active Users</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyMetrics}>
                      <XAxis dataKey="date" stroke="#64748b" fontSize={10} interval="preserveStartEnd" />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid rgba(212, 175, 55, 0.2)',
                          borderRadius: '8px'
                        }}
                      />
                      <Area type="monotone" dataKey="users" stroke="#10b981" fill="url(#usersGradient)" />
                      <defs>
                        <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="glass-panel p-4 rounded-xl">
                <h3 className="text-sm font-medium text-slate-300 mb-4">Session Duration (avg seconds)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyMetrics}>
                      <XAxis dataKey="date" stroke="#64748b" fontSize={10} interval="preserveStartEnd" />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid rgba(212, 175, 55, 0.2)',
                          borderRadius: '8px'
                        }}
                      />
                      <Line type="monotone" dataKey="avgDuration" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </section>
        )}

        {isAppwriteConfigured() && globalStats && (
          <section className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-panel p-4 rounded-xl">
                <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
                  <Smartphone size={14} className="text-blue-400" />
                  Device Distribution
                </h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={globalStats.topScreenSizes}
                        dataKey="count"
                        nameKey="size"
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                      >
                        {globalStats.topScreenSizes.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid rgba(212, 175, 55, 0.2)',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="glass-panel p-4 rounded-xl">
                <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
                  <Monitor size={14} className="text-emerald-400" />
                  Platforms
                </h3>
                <div className="space-y-3 mt-2">
                  {globalStats.topPlatforms.map((p, idx) => (
                    <div key={p.platform} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                        <span className="text-sm text-slate-300 capitalize">{p.platform}</span>
                      </div>
                      <span className="text-sm text-slate-400">{p.count.toLocaleString()}</span>
                    </div>
                  ))}
                  {globalStats.topPlatforms.length === 0 && (
                    <p className="text-sm text-slate-500">No platform data yet</p>
                  )}
                </div>
              </div>
              
              <div className="glass-panel p-4 rounded-xl">
                <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
                  <Globe size={14} className="text-purple-400" />
                  Top Timezones
                </h3>
                <div className="space-y-3 mt-2">
                  {globalStats.topTimezones.map((t, idx) => (
                    <div key={t.timezone} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                        <span className="text-sm text-slate-300">{t.timezone}</span>
                      </div>
                      <span className="text-sm text-slate-400">{t.count.toLocaleString()}</span>
                    </div>
                  ))}
                  {globalStats.topTimezones.length === 0 && (
                    <p className="text-sm text-slate-500">No timezone data yet</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="mb-8">
          <h2 className="text-lg font-medium text-slate-300 mb-4 flex items-center gap-2">
            <Eye size={18} className="text-gold-400" />
            Your Usage Stats
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="glass-panel p-4 rounded-xl">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Activity size={14} />
                Total Counts
              </div>
              <p className="text-2xl font-serif text-gold-400">{totalCount.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">{uniqueDays} active days</p>
              {weeklyTrend !== 0 && (
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp size={12} className={weeklyTrend >= 0 ? 'text-emerald-400' : 'text-red-400'} />
                  <span className={cn("text-xs", weeklyTrend >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                    {weeklyTrend >= 0 ? '+' : ''}{weeklyTrend}%
                  </span>
                </div>
              )}
            </div>
            
            <div className="glass-panel p-4 rounded-xl">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Calendar size={14} className="text-emerald-400" />
                Today
              </div>
              <p className="text-2xl font-serif text-emerald-400">{todayCount.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">counts today</p>
            </div>
            
            <div className="glass-panel p-4 rounded-xl">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Flame size={14} className="text-orange-400" />
                Streak
              </div>
              <p className="text-2xl font-serif text-orange-400">{currentStreak}</p>
              <p className="text-xs text-slate-500 mt-1">days</p>
            </div>
            
            <div className="glass-panel p-4 rounded-xl">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <TrendingUp size={14} className="text-blue-400" />
                Avg/Day
              </div>
              <p className="text-2xl font-serif text-blue-400">{avgPerDay.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">best: {bestDay.toLocaleString()}</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="glass-panel p-4 rounded-xl">
              <h3 className="text-sm font-medium text-slate-300 mb-4">Daily Activity (Last 7 Days)</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={last7Days}>
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid rgba(212, 175, 55, 0.2)',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="count" fill="#d4af37" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="glass-panel p-4 rounded-xl">
              <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
                Hourly Distribution
                <span className="text-xs text-slate-500 ml-auto">Peak: {peakHour.hour}</span>
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourlyData}>
                    <XAxis dataKey="hour" stroke="#64748b" fontSize={10} interval={2} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid rgba(212, 175, 55, 0.2)',
                        borderRadius: '8px'
                      }}
                    />
                    <Area type="monotone" dataKey="count" stroke="#d4af37" fill="url(#hourGradient)" />
                    <defs>
                      <linearGradient id="hourGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <div className="glass-panel p-4 rounded-xl">
            <h3 className="text-sm font-medium text-slate-300 mb-4">Prayer Adhkar Completion</h3>
            <div className="grid grid-cols-5 gap-2 sm:gap-4">
              {prayerStats.map((prayer, idx) => (
                <div key={prayer.name} className="text-center">
                  <div className="text-lg sm:text-xl font-arabic text-gold-400">{prayer.arabic}</div>
                  <div className="text-[10px] sm:text-xs text-slate-400">{prayer.name}</div>
                  <div className="mt-2 relative h-14 w-14 sm:h-16 sm:w-16 mx-auto">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="50%" cy="50%" r="45%"
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth="4"
                      />
                      <circle
                        cx="50%" cy="50%" r="45%"
                        fill="none"
                        stroke={COLORS[idx % COLORS.length]}
                        strokeWidth="4"
                        strokeDasharray={`${(prayer.last7Days / 7) * (Math.PI * 2 * 0.45 * 32)} ${Math.PI * 2 * 0.45 * 32}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-slate-200">{prayer.last7Days}</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">last 7 days</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-panel p-4 rounded-xl">
              <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
                <Target size={14} className="text-gold-400" />
                Goals Progress
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Completed</span>
                  <span className="text-sm font-medium text-emerald-400">{completedTargets}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Active</span>
                  <span className="text-sm font-medium text-gold-400">{totalTargets - completedTargets}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Completion Rate</span>
                  <span className="text-sm font-medium text-slate-200">{targetCompletionRate}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-2">
                  <div 
                    className="h-full bg-gradient-to-r from-gold-500 to-emerald-500 transition-all"
                    style={{ width: `${targetCompletionRate}%` }}
                  />
                </div>
              </div>
            </div>
            
            <div className="glass-panel p-4 rounded-xl">
              <h3 className="text-sm font-medium text-slate-300 mb-4">Lifetime Statistics</h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-xl font-serif text-gold-400">{lifetimeCount.toLocaleString()}</p>
                  <p className="text-xs text-slate-500">Total Counts</p>
                </div>
                <div>
                  <p className="text-xl font-serif text-emerald-400">{prayerCompletions?.length || 0}</p>
                  <p className="text-xs text-slate-500">Prayers Completed</p>
                </div>
                <div>
                  <p className="text-xl font-serif text-blue-400">{logs ? new Set(logs.map(l => l.dateStr)).size : 0}</p>
                  <p className="text-xs text-slate-500">Active Days</p>
                </div>
                <div>
                  <p className="text-xl font-serif text-purple-400">{totalTargets}</p>
                  <p className="text-xs text-slate-500">Total Goals</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {!isAppwriteConfigured() && (
          <div className="glass-panel p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-amber-400">Global Analytics Not Configured</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Add Appwrite credentials to enable app-wide user tracking, session duration, and platform analytics.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="text-center text-xs text-slate-600 mt-8">
          Last updated: {format(lastUpdated, 'MMM dd, h:mm a')}
        </div>
      </div>
    </div>
  );
}