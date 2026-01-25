import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { Plus, X } from 'lucide-react';
import { 
  subDays, 
  format, 
  subWeeks, 
  subMonths, 
  subYears, 
  isSameWeek, 
  isSameMonth, 
  isSameYear 
} from 'date-fns';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type TimeRange = 'daily' | 'weekly' | 'monthly' | 'yearly';

type ChartData = {
  name: string;
  fullDate: string;
  count: number;
};

export function Stats() {
  const [timeRange, setTimeRange] = useState<TimeRange>('daily');
  const [selectedTargetId, setSelectedTargetId] = useState<number | 'all'>('all');
  const [showManualEntry, setShowManualEntry] = useState(false);
  
  const logs = useLiveQuery(() => db.logs.toArray());
  const targets = useLiveQuery(() => db.targets.toArray());
  const durations = useLiveQuery(() => db.durations.toArray());

  // Manual Entry State
  const [manualCount, setManualCount] = useState('');
  const [manualDate, setManualDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [manualTargetId, setManualTargetId] = useState<string>('');

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCount) return;

    const count = parseInt(manualCount);
    const date = new Date(manualDate);
    
    // Add log
    await db.logs.add({
      count,
      timestamp: date,
      dateStr: manualDate,
      targetId: manualTargetId ? parseInt(manualTargetId) : undefined
    });

    // Update target if selected
    if (manualTargetId) {
      const target = await db.targets.get(parseInt(manualTargetId));
      if (target) {
        await db.targets.update(target.id!, {
          currentCount: (target.currentCount || 0) + count
        });
      }
    }

    // Reset & Close
    setManualCount('');
    setManualTargetId('');
    setShowManualEntry(false);
  };

  // --- Data Processing Logic ---
  const processData = (): ChartData[] => {
    if (!logs) return [];

    // Filter logs first based on selected target
    const filteredLogs = selectedTargetId === 'all' 
      ? logs 
      : logs.filter(l => l.targetId === selectedTargetId);

    const now = new Date();
    let data: ChartData[] = [];

    if (timeRange === 'daily') {
      // Last 7 Days
      data = Array.from({ length: 7 }).map((_, i) => {
        const date = subDays(now, 6 - i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const count = filteredLogs.filter(l => l.dateStr === dateStr).reduce((acc, l) => acc + l.count, 0);
        return {
          name: format(date, 'EEE'), // Mon
          fullDate: dateStr,
          count
        };
      });
    } 
    else if (timeRange === 'weekly') {
      // Last 8 Weeks
      data = Array.from({ length: 8 }).map((_, i) => {
        const date = subWeeks(now, 7 - i);
        // Filter logs that fall in this week
        const count = filteredLogs.filter(l => isSameWeek(l.timestamp, date, { weekStartsOn: 1 })).reduce((acc, l) => acc + l.count, 0);
        return {
          name: `W${format(date, 'w')}`, // W42
          fullDate: format(date, 'MMM d'),
          count
        };
      });
    }
    else if (timeRange === 'monthly') {
      // Last 6 Months
      data = Array.from({ length: 6 }).map((_, i) => {
        const date = subMonths(now, 5 - i);
        const count = filteredLogs.filter(l => isSameMonth(l.timestamp, date)).reduce((acc, l) => acc + l.count, 0);
        return {
          name: format(date, 'MMM'), // Jan
          fullDate: format(date, 'MMMM yyyy'),
          count
        };
      });
    }
    else if (timeRange === 'yearly') {
      // Last 3 Years (including current)
      data = Array.from({ length: 3 }).map((_, i) => {
        const date = subYears(now, 2 - i);
        const count = filteredLogs.filter(l => isSameYear(l.timestamp, date)).reduce((acc, l) => acc + l.count, 0);
        return {
          name: format(date, 'yyyy'), // 2024
          fullDate: format(date, 'yyyy'),
          count
        };
      });
    }

    return data;
  };

  const data = processData();
  
  // Calculate totals based on filtered view
  const filteredLogs = selectedTargetId === 'all' 
      ? (logs || [])
      : (logs || []).filter(l => l.targetId === selectedTargetId);

  const totalLifetime = filteredLogs.reduce((acc, l) => acc + l.count, 0);
  
  // Calculate Time Spent
  const filteredDurations = selectedTargetId === 'all'
    ? (durations || [])
    : (durations || []).filter(d => d.targetId === selectedTargetId);
    
  const totalSeconds = filteredDurations.reduce((acc, d) => acc + d.seconds, 0);
  
  const formatDuration = (secs: number) => {
    if (secs < 60) return `${secs}s`;
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };
  
  // Quick Best Day Logic (Filtered)
  const bestDayCount = filteredLogs.length > 0 ? Math.max(0, ...Object.values(filteredLogs.reduce((acc: any, l) => {
    acc[l.dateStr] = (acc[l.dateStr] || 0) + l.count;
    return acc;
  }, {}) as Record<string, number>)) : 0;

  return (
    <div className="px-6 py-8 space-y-8 pb-32">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="font-serif text-3xl text-slate-100">Progress</h1>
          <p className="text-slate-400 text-sm mt-1">Analytics & Insights</p>
        </div>
        
        <div className="flex gap-2">
          {/* Manual Add Button */}
          <button
            onClick={() => setShowManualEntry(true)}
            className="bg-slate-800 p-2 rounded-lg text-gold-400 hover:bg-slate-700 transition-colors border border-white/5"
          >
            <Plus size={20} />
          </button>

          {/* Zikr Filter Dropdown */}
          <select
            value={selectedTargetId}
            onChange={(e) => setSelectedTargetId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="bg-slate-900/80 border border-gold-500/20 rounded-lg text-xs p-2 text-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-500 max-w-[120px] truncate"
          >
            <option value="all">All Goals</option>
            {targets?.map(t => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        </div>
      </header>

      {/* Manual Entry Modal */}
      <AnimatePresence>
        {showManualEntry && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-midnight-900 border border-gold-500/20 w-full max-w-sm rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif text-xl text-slate-100">Log Offline Dhikr</h3>
                <button onClick={() => setShowManualEntry(false)} className="text-slate-500 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div>
                  <label className="text-xs uppercase text-slate-500 font-bold ml-1">Count</label>
                  <input
                    type="number"
                    placeholder="e.g. 100"
                    value={manualCount}
                    onChange={e => setManualCount(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl p-3 text-white text-lg focus:border-gold-500/50 outline-none"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-xs uppercase text-slate-500 font-bold ml-1">Assign to Goal (Optional)</label>
                  <select
                    value={manualTargetId}
                    onChange={e => setManualTargetId(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl p-3 text-slate-300 focus:border-gold-500/50 outline-none"
                  >
                    <option value="">General (No Goal)</option>
                    {targets?.filter(t => t.status === 'active').map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs uppercase text-slate-500 font-bold ml-1">Date</label>
                  <input
                    type="date"
                    value={manualDate}
                    onChange={e => setManualDate(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-gold-500/50 outline-none"
                  />
                </div>

                <button type="submit" className="w-full bg-gold-500 text-midnight-950 font-bold py-3 rounded-xl hover:bg-gold-400 transition-colors mt-2">
                  Add to History
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard title="Lifetime" value={totalLifetime.toLocaleString()} />
        <StatCard title="Time Spent" value={formatDuration(totalSeconds)} />
        <StatCard title="Best Day" value={bestDayCount.toLocaleString()} />
      </div>

      {/* Filter Tabs */}
      <div className="bg-midnight-900/50 p-1 rounded-xl flex border border-white/5">
        {(['daily', 'weekly', 'monthly', 'yearly'] as TimeRange[]).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={cn(
              "flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all relative",
              timeRange === range ? "text-midnight-950" : "text-slate-500 hover:text-slate-300"
            )}
          >
            {timeRange === range && (
              <motion.div
                layoutId="filter-pill"
                className="absolute inset-0 bg-gold-500 rounded-lg shadow-lg shadow-gold-500/20"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{range}</span>
          </button>
        ))}
      </div>

      {/* Chart Section */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">{timeRange} Activity</h2>
        </div>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                dy={10}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                  borderColor: 'rgba(212, 175, 55, 0.2)', 
                  color: '#f8fafc',
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
                  fontSize: '12px'
                }}
                labelStyle={{ color: '#94a3b8', marginBottom: '0.5rem' }}
                itemStyle={{ color: '#fbbf24' }}
              />
              <Bar dataKey="count" radius={[4, 4, 4, 4]} barSize={32}>
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.count > 0 ? 'url(#goldGradient)' : '#1e293b'} 
                  />
                ))}
              </Bar>
              <defs>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#d97706" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string, value: string }) {
  return (
    <div className="glass-card p-4 rounded-2xl relative overflow-hidden group flex flex-col justify-center h-24">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <div className="w-12 h-12 bg-gold-500 rounded-full blur-xl" />
      </div>
      <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-1 truncate">{title}</p>
      <p className="text-2xl font-serif text-slate-100 group-hover:text-gold-400 transition-colors truncate">
        {value}
      </p>
    </div>
  );
}
