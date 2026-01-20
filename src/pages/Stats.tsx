import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
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
import { motion } from 'framer-motion';

type TimeRange = 'daily' | 'weekly' | 'monthly' | 'yearly';

type ChartData = {
  name: string;
  fullDate: string;
  count: number;
};

export function Stats() {
  const [timeRange, setTimeRange] = useState<TimeRange>('daily');
  const logs = useLiveQuery(() => db.logs.toArray());

  // --- Data Processing Logic ---
  const processData = (): ChartData[] => {
    if (!logs) return [];

    const now = new Date();
    let data: ChartData[] = [];

    if (timeRange === 'daily') {
      // Last 7 Days
      data = Array.from({ length: 7 }).map((_, i) => {
        const date = subDays(now, 6 - i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const count = logs.filter(l => l.dateStr === dateStr).reduce((acc, l) => acc + l.count, 0);
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
        const count = logs.filter(l => isSameWeek(l.timestamp, date, { weekStartsOn: 1 })).reduce((acc, l) => acc + l.count, 0);
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
        const count = logs.filter(l => isSameMonth(l.timestamp, date)).reduce((acc, l) => acc + l.count, 0);
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
        const count = logs.filter(l => isSameYear(l.timestamp, date)).reduce((acc, l) => acc + l.count, 0);
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
  const totalLifetime = logs?.reduce((acc, l) => acc + l.count, 0) || 0;
  
  // Quick Best Day Logic
  const bestDayCount = logs ? Math.max(0, ...Object.values(logs.reduce((acc: any, l) => {
    acc[l.dateStr] = (acc[l.dateStr] || 0) + l.count;
    return acc;
  }, {}) as Record<string, number>)) : 0;

  return (
    <div className="px-6 py-8 space-y-8 pb-32">
      <header>
        <h1 className="font-serif text-3xl text-slate-100">Progress</h1>
        <p className="text-slate-400 text-sm mt-1">Analytics & Insights</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard title="Lifetime" value={totalLifetime} />
        <StatCard title="Best Day" value={bestDayCount} />
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

function StatCard({ title, value }: { title: string, value: number }) {
  return (
    <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <div className="w-16 h-16 bg-gold-500 rounded-full blur-xl" />
      </div>
      <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-1">{title}</p>
      <p className="text-3xl font-serif text-slate-100 group-hover:text-gold-400 transition-colors">
        {value.toLocaleString()}
      </p>
    </div>
  );
}
