import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { type AdhkarSession, type AdhkarJournal } from '../lib/db';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, Calendar, Clock, Flame, Target, 
  Download, TrendingUp, BookOpen
} from 'lucide-react';
import { cn } from '../lib/utils';
import { 
  getSessionHistory, 
  getJournalHistory, 
  getAllStreaks,
  getWeeklySummary,
  exportHistory 
} from '../lib/adhkarTracking';

export function AdhkarHistory() {
  const [activeTab, setActiveTab] = useState<'sessions' | 'journal' | 'streaks'>('sessions');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('7d');
  
  const sessions = useLiveQuery(() => {
    const limit = timeRange === '7d' ? 50 : timeRange === '30d' ? 200 : 1000;
    return getSessionHistory(limit);
  }, [timeRange]);
  
  const journal = useLiveQuery(() => {
    const limit = timeRange === '7d' ? 100 : timeRange === '30d' ? 500 : 5000;
    return getJournalHistory(limit);
  }, [timeRange]);
  
  const streaks = useLiveQuery(() => getAllStreaks(), []);
  const weeklySummary = useLiveQuery(() => getWeeklySummary(), []);
  
  const handleExport = async () => {
    const data = await exportHistory('json');
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `adhkar-history-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };
  
  const formatDate = (dateStr: string): string => {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d, yyyy');
  };
  
  const groupedSessions = sessions?.reduce((acc, session) => {
    const date = session.dateStr;
    if (!acc[date]) acc[date] = [];
    acc[date].push(session);
    return acc;
  }, {} as Record<string, AdhkarSession[]>);
  
  const groupedJournal = journal?.reduce((acc, entry) => {
    const date = entry.dateStr;
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, AdhkarJournal[]>);

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-32">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold-500/10">
              <History size={28} className="text-gold-400" />
            </div>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl text-slate-100">Adhkar History</h1>
              <p className="text-slate-500 text-sm">Track your adhkar journey</p>
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
              <option value="all">All time</option>
            </select>
            
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:border-gold-500 transition-colors"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </header>

        {/* Weekly Summary */}
        {weeklySummary && (
          <section className="mb-8">
            <h2 className="text-lg font-medium text-slate-300 mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-gold-400" />
              This Week
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="glass-panel p-4 rounded-xl">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Target size={14} />
                  Total Counts
                </div>
                <p className="text-2xl font-serif text-gold-400">{weeklySummary.totalCounts.toLocaleString()}</p>
              </div>
              
              <div className="glass-panel p-4 rounded-xl">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Clock size={14} className="text-emerald-400" />
                  Total Time
                </div>
                <p className="text-2xl font-serif text-emerald-400">{formatDuration(weeklySummary.totalDuration)}</p>
              </div>
              
              <div className="glass-panel p-4 rounded-xl">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <BookOpen size={14} className="text-blue-400" />
                  Sessions
                </div>
                <p className="text-2xl font-serif text-blue-400">{weeklySummary.totalSessions}</p>
              </div>
              
              <div className="glass-panel p-4 rounded-xl">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Flame size={14} className="text-orange-400" />
                  Active Days
                </div>
                <p className="text-2xl font-serif text-orange-400">
                  {weeklySummary.days.filter(d => d.sessionsCount > 0).length}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'sessions', label: 'Sessions', icon: BookOpen },
            { id: 'journal', label: 'Journal', icon: Calendar },
            { id: 'streaks', label: 'Streaks', icon: Flame }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                activeTab === tab.id 
                  ? "bg-gold-500/20 text-gold-400 border border-gold-500/30" 
                  : "bg-slate-800/50 text-slate-400 border border-transparent hover:text-slate-200"
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'sessions' && (
            <motion.div
              key="sessions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {groupedSessions && Object.entries(groupedSessions).length > 0 ? (
                Object.entries(groupedSessions).map(([date, dateSessions]) => (
                  <div key={date}>
                    <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                      <Calendar size={14} />
                      {formatDate(date)}
                    </h3>
                    
                    <div className="space-y-2">
                      {dateSessions.map((session) => (
                        <div 
                          key={session.id}
                          className="glass-panel p-4 rounded-xl"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-slate-200">{session.collectionName}</h4>
                            <span className="text-xs text-slate-500">
                              {format(new Date(session.startedAt), 'h:mm a')}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {formatDuration(session.durationSeconds)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Target size={12} />
                              {session.totalCounts} counts
                            </span>
                            <span className={cn(
                              "px-2 py-0.5 rounded-full",
                              session.completedItems === session.totalItems 
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-amber-500/20 text-amber-400"
                            )}>
                              {session.completedItems}/{session.totalItems} completed
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <History size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No sessions recorded yet</p>
                  <p className="text-sm mt-1">Start an adhkar collection to track your progress</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'journal' && (
            <motion.div
              key="journal"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {groupedJournal && Object.entries(groupedJournal).length > 0 ? (
                Object.entries(groupedJournal).map(([date, entries]) => (
                  <div key={date}>
                    <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                      <Calendar size={14} />
                      {formatDate(date)}
                    </h3>
                    
                    <div className="space-y-2">
                      {entries.map((entry, idx) => (
                        <div 
                          key={entry.id || idx}
                          className="glass-panel p-4 rounded-xl"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-slate-200">{entry.dhikrName}</p>
                              {entry.dhikrArabic && (
                                <p className="text-gold-400/70 font-arabic text-sm" dir="rtl">
                                  {entry.dhikrArabic}
                                </p>
                              )}
                              <p className="text-xs text-slate-500 mt-1">{entry.collectionName}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-serif text-gold-400">{entry.count}/{entry.target}</p>
                              <p className="text-xs text-slate-500">
                                {format(new Date(entry.completedAt), 'h:mm a')}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No journal entries yet</p>
                  <p className="text-sm mt-1">Complete adhkar to build your journal</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'streaks' && (
            <motion.div
              key="streaks"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {streaks && streaks.length > 0 ? (
                streaks.map((streak) => (
                  <div 
                    key={streak.id}
                    className="glass-panel p-4 rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-500/20">
                          <Flame size={20} className="text-orange-400" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-200">{streak.collectionId}</p>
                          <p className="text-xs text-slate-500">Last: {formatDate(streak.lastCompletedDate)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                        <p className="text-2xl font-serif text-orange-400">{streak.currentStreak}</p>
                        <p className="text-xs text-slate-500">Current Streak</p>
                      </div>
                      <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                        <p className="text-2xl font-serif text-gold-400">{streak.longestStreak}</p>
                        <p className="text-xs text-slate-500">Longest Streak</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Flame size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No streaks yet</p>
                  <p className="text-sm mt-1">Complete adhkar daily to build streaks</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
