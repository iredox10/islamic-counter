import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Target } from '../lib/db';
import { Plus, Trash2, Trophy, PlayCircle, Clock, Bell } from 'lucide-react';
import { differenceInDays, format } from 'date-fns';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export function Targets() {
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  const targets = useLiveQuery(() => db.targets.toArray());

  // Form State
  const [title, setTitle] = useState('');
  const [targetCount, setTargetCount] = useState('');
  const [startTime, setStartTime] = useState('');
  const [deadline, setDeadline] = useState('');
  const [reminderGap, setReminderGap] = useState('');

  const handleAddTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetCount) return;

    await db.targets.add({
      title,
      targetCount: parseInt(targetCount),
      currentCount: 0,
      startTime: startTime ? new Date(startTime) : new Date(),
      deadline: deadline ? new Date(deadline) : undefined,
      reminderMinutes: reminderGap ? parseInt(reminderGap) : undefined,
      createdAt: new Date(),
      status: 'active'
    });

    // Reset
    setTitle('');
    setTargetCount('');
    setStartTime('');
    setDeadline('');
    setReminderGap('');
    setShowAddForm(false);
    
    // Request permission if not granted yet
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (confirm('Delete this target?')) db.targets.delete(id);
  };

  const handleSelectTarget = (target: Target) => {
    localStorage.setItem('counter-state', JSON.stringify({
      count: target.currentCount,
      targetId: target.id
    }));
    navigate('/');
  };

  const activeTargets = targets?.filter(t => t.status === 'active') || [];

  return (
    <div className="px-6 py-8 space-y-8 pb-32">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="font-serif text-3xl text-slate-100">Goals</h1>
          <p className="text-slate-400 text-sm mt-1">Select a goal to start counting</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gold-500 text-midnight-950 p-3 rounded-xl shadow-lg shadow-gold-500/20 hover:scale-105 transition-transform"
        >
          <Plus size={24} />
        </button>
      </header>

      <AnimatePresence>
        {showAddForm && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleAddTarget} 
            className="glass-panel p-5 rounded-2xl space-y-4 overflow-hidden border-gold-500/20"
          >
            <h3 className="text-gold-400 text-xs uppercase tracking-widest font-bold mb-2">New Goal</h3>
            
            <input
              type="text"
              placeholder="Goal Title (e.g. 1000 Salawat)"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl p-3 text-white placeholder-slate-500 focus:border-gold-500/50 outline-none transition-colors"
              autoFocus
            />
            
            <div className="flex gap-4">
              <input
                type="number"
                placeholder="Count"
                value={targetCount}
                onChange={e => setTargetCount(e.target.value)}
                className="w-1/2 bg-slate-950/50 border border-slate-700/50 rounded-xl p-3 text-white placeholder-slate-500 focus:border-gold-500/50 outline-none transition-colors"
              />
              <select
                value={reminderGap}
                onChange={e => setReminderGap(e.target.value)}
                className="w-1/2 bg-slate-950/50 border border-slate-700/50 rounded-xl p-3 text-slate-300 focus:border-gold-500/50 outline-none transition-colors text-sm"
              >
                <option value="">No Reminder</option>
                <option value="15">15 mins late</option>
                <option value="30">30 mins late</option>
                <option value="60">1 hour late</option>
                <option value="120">2 hours late</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase text-slate-500 font-bold tracking-wider ml-1">Start Time</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-gold-500/50 outline-none transition-colors text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase text-slate-500 font-bold tracking-wider ml-1">Deadline (Optional)</label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-gold-500/50 outline-none transition-colors text-sm"
              />
            </div>

            <button type="submit" className="w-full bg-gradient-to-r from-gold-500 to-gold-600 text-midnight-950 font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-gold-500/20 transition-all mt-2">
              Create Goal
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {activeTargets.length === 0 && !showAddForm && (
          <div className="text-center py-12 opacity-40">
            <Trophy size={48} className="mx-auto mb-4 text-slate-600" />
            <p>No active goals</p>
          </div>
        )}
        
        {activeTargets.map(target => (
          <div key={target.id} onClick={() => handleSelectTarget(target)} className="cursor-pointer">
            <TargetCard 
              target={target} 
              onDelete={(e) => handleDelete(e, target.id!)} 
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function TargetCard({ target, onDelete }: { target: Target; onDelete: (e: React.MouseEvent) => void }) {
  const progress = Math.min(100, Math.round((target.currentCount / target.targetCount) * 100));
  const daysLeft = target.deadline ? differenceInDays(target.deadline, new Date()) : null;

  return (
    <div className="glass-card rounded-2xl p-5 group relative overflow-hidden transition-transform active:scale-[0.98]">
      {/* Background Gradient for progress hint */}
      <div 
        className="absolute bottom-0 left-0 h-1 bg-gold-500/50 transition-all duration-1000"
        style={{ width: `${progress}%` }}
      />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-lg text-slate-100 group-hover:text-gold-400 transition-colors">{target.title}</h3>
            <PlayCircle size={14} className="text-gold-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2 font-medium tracking-wide">
            <span className="bg-slate-800/50 px-2 py-1 rounded-md border border-white/5">
              {target.targetCount.toLocaleString()} Target
            </span>
            {target.deadline && (
              <span className={cn("flex items-center gap-1", daysLeft && daysLeft < 3 ? "text-red-400" : "")}>
                <Clock size={10} /> {daysLeft} days left
              </span>
            )}
            {target.startTime && (
               <span className="flex items-center gap-1 text-slate-500">
                 Start: {format(target.startTime, 'MMM d, HH:mm')}
               </span>
            )}
          </div>
        </div>
        
        <button onClick={onDelete} className="text-slate-500 hover:text-red-400 p-2 -mr-2 -mt-2 z-20">
          <Trash2 size={16} />
        </button>
      </div>

      <div className="relative h-2 bg-slate-950/50 rounded-full overflow-hidden">
        <div 
           className="absolute h-full bg-gradient-to-r from-gold-600 to-gold-400 rounded-full"
           style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] mt-2 text-slate-500 uppercase tracking-wider font-semibold">
        <span>{target.currentCount.toLocaleString()} done</span>
        <span>{progress}%</span>
      </div>
      
      {/* Reminder Indicator */}
      {target.reminderMinutes && (
        <div className="absolute top-2 right-2 opacity-10">
          <Bell size={40} />
        </div>
      )}
    </div>
  );
}
