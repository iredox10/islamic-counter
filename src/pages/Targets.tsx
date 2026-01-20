import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Target } from '../lib/db';
import { Plus, Trash2, Trophy } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function Targets() {
  const [showAddForm, setShowAddForm] = useState(false);
  const targets = useLiveQuery(() => db.targets.toArray());

  // Form State
  const [title, setTitle] = useState('');
  const [targetCount, setTargetCount] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleAddTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetCount) return;

    await db.targets.add({
      title,
      targetCount: parseInt(targetCount),
      currentCount: 0,
      deadline: deadline ? new Date(deadline) : undefined,
      createdAt: new Date(),
      status: 'active'
    });

    setTitle('');
    setTargetCount('');
    setDeadline('');
    setShowAddForm(false);
  };

  const handleDelete = (id: number) => {
    if (confirm('Delete this target?')) db.targets.delete(id);
  };

  const activeTargets = targets?.filter(t => t.status === 'active') || [];

  return (
    <div className="px-6 py-8 space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="font-serif text-3xl text-slate-100">Goals</h1>
          <p className="text-slate-400 text-sm mt-1">Track your spiritual milestones</p>
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
            className="glass-panel p-5 rounded-2xl space-y-4 overflow-hidden"
          >
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
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-1/2 bg-slate-950/50 border border-slate-700/50 rounded-xl p-3 text-white placeholder-slate-500 focus:border-gold-500/50 outline-none transition-colors"
              />
            </div>
            <button type="submit" className="w-full bg-slate-100 text-midnight-950 font-bold py-3 rounded-xl hover:bg-white transition-colors">
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
          <TargetCard key={target.id} target={target} onDelete={() => handleDelete(target.id!)} />
        ))}
      </div>
    </div>
  );
}

function TargetCard({ target, onDelete }: { target: Target; onDelete: () => void }) {
  const progress = Math.min(100, Math.round((target.currentCount / target.targetCount) * 100));
  const daysLeft = target.deadline ? differenceInDays(target.deadline, new Date()) : null;

  return (
    <div className="glass-card rounded-2xl p-5 group relative overflow-hidden">
      {/* Background Gradient for progress hint */}
      <div 
        className="absolute bottom-0 left-0 h-1 bg-gold-500/50 transition-all duration-1000"
        style={{ width: `${progress}%` }}
      />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="font-serif text-lg text-slate-100 group-hover:text-gold-400 transition-colors">{target.title}</h3>
          <div className="flex items-center gap-3 text-xs text-slate-400 mt-2 font-medium tracking-wide">
            <span className="bg-slate-800/50 px-2 py-1 rounded-md border border-white/5">
              {target.targetCount.toLocaleString()} Target
            </span>
            {target.deadline && (
              <span className={cn("flex items-center gap-1", daysLeft && daysLeft < 3 ? "text-red-400" : "")}>
                {daysLeft} days left
              </span>
            )}
          </div>
        </div>
        
        <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-red-400 p-2">
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
    </div>
  );
}
