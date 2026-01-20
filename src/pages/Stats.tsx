import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { subDays, format } from 'date-fns';

export function Stats() {
  const logs = useLiveQuery(() => db.logs.toArray());

  const data = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayLogs = logs?.filter(l => l.dateStr === dateStr) || [];
    const count = dayLogs.reduce((acc, l) => acc + l.count, 0);
    return {
      name: format(date, 'EEE'),
      fullDate: dateStr,
      count: count
    };
  });

  const totalLifetime = logs?.reduce((acc, l) => acc + l.count, 0) || 0;
  
  // Best day logic
  const countsByDay = logs?.reduce((acc: any, l) => {
    acc[l.dateStr] = (acc[l.dateStr] || 0) + l.count;
    return acc;
  }, {}) as Record<string, number>;
  const bestDayCount = countsByDay ? Math.max(0, ...Object.values(countsByDay)) : 0;

  return (
    <div className="px-6 py-8 space-y-8">
      <header>
        <h1 className="font-serif text-3xl text-slate-100">Progress</h1>
        <p className="text-slate-400 text-sm mt-1">Analytics & Insights</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard title="Total Count" value={totalLifetime} />
        <StatCard title="Best Day" value={bestDayCount} />
      </div>

      {/* Chart Section */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Weekly Activity</h2>
          <div className="flex gap-2">
             <div className="w-2 h-2 rounded-full bg-gold-500"></div>
             <div className="w-2 h-2 rounded-full bg-slate-700"></div>
          </div>
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
                  backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                  borderColor: 'rgba(255,255,255,0.1)', 
                  color: '#f8fafc',
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
                  fontSize: '12px'
                }}
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
