import { db } from '../lib/db';
import { Download, Upload, Trash2, CheckCircle2, Sun, Moon, Monitor, Bell, BellOff, Clock, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme, type Theme } from '../lib/ThemeContext';
import { cn } from '../lib/utils';
import { getStoredReminders, saveReminders, updateReminder, type DailyReminder } from '../lib/reminders';

export function Settings() {
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [reminders, setReminders] = useState<DailyReminder[]>([]);
  const [autoReset, setAutoReset] = useState(() => localStorage.getItem('auto-reset') === 'true');

  useEffect(() => {
    setReminders(getStoredReminders());
  }, []);

  const handleToggleAutoReset = () => {
    const newValue = !autoReset;
    setAutoReset(newValue);
    localStorage.setItem('auto-reset', String(newValue));
  };

  const handleToggleReminder = (id: string) => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    const updated = updateReminder(reminders, id, { 
      enabled: !reminders.find(r => r.id === id)?.enabled 
    });
    setReminders(updated);
    saveReminders(updated);
  };

  const handleTimeChange = (id: string, time: string) => {
    const updated = updateReminder(reminders, id, { time });
    setReminders(updated);
    saveReminders(updated);
  };

  const handleExport = async () => {
    try {
      const logs = await db.logs.toArray();
      const targets = await db.targets.toArray();
      
      const backupData = {
        version: 1,
        timestamp: new Date().toISOString(),
        logs,
        targets
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `tasbih-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed', err);
      alert('Export failed');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        if (!json.logs || !json.targets) throw new Error('Invalid backup file');

        // Restore
        await db.transaction('rw', db.logs, db.targets, async () => {
          await db.logs.clear();
          await db.targets.clear();
          
          await db.logs.bulkAdd(json.logs);
          await db.targets.bulkAdd(json.targets);
        });

        setImportStatus('success');
        setTimeout(() => setImportStatus('idle'), 3000);
      } catch (err) {
        console.error(err);
        setImportStatus('error');
        alert('Invalid backup file');
      }
    };
    reader.readAsText(file);
  };

  const handleResetAll = async () => {
    if (confirm('DANGER: This will delete ALL data permanently. Are you sure?')) {
        if (confirm('Really sure? There is no undo.')) {
            await db.delete();
            window.location.reload();
        }
    }
  };

  return (
    <div className="px-6 py-8 space-y-8 pb-32">
      <header>
        <h1 className="font-serif text-3xl text-slate-100">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your data</p>
      </header>

      <div className="space-y-6">
        {/* Theme Section */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold text-gold-500 uppercase tracking-widest">Appearance</h2>
          
          <div className="glass-panel p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-slate-300">Theme</span>
            </div>
            <div className="flex gap-2">
              <ThemeButton 
                theme="light" 
                icon={Sun} 
                label="Light" 
              />
              <ThemeButton 
                theme="dark" 
                icon={Moon} 
                label="Dark" 
              />
              <ThemeButton 
                theme="system" 
                icon={Monitor} 
                label="System" 
              />
            </div>
          </div>
        </section>

        {/* Reminders Section */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold text-gold-500 uppercase tracking-widest">Daily Reminders</h2>
          
          <div className="glass-panel p-4 rounded-xl space-y-2">
            {reminders.map(reminder => (
              <div key={reminder.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/30">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleReminder(reminder.id)}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      reminder.enabled 
                        ? "bg-gold-500/20 text-gold-400" 
                        : "bg-slate-700/50 text-slate-500"
                    )}
                  >
                    {reminder.enabled ? <Bell size={18} /> : <BellOff size={18} />}
                  </button>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{reminder.name}</p>
                    <p className="text-[10px] text-slate-500">{reminder.message}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-slate-500" />
                  <input
                    type="time"
                    value={reminder.time}
                    onChange={(e) => handleTimeChange(reminder.id, e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300 outline-none focus:border-gold-500/50"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Session Section */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold text-gold-500 uppercase tracking-widest">Session Settings</h2>
          
          <div className="glass-panel p-4 rounded-xl">
            <button 
              onClick={handleToggleAutoReset}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg transition-colors",
                  autoReset ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-700/50 text-slate-500"
                )}>
                  <RefreshCw size={18} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-200">Auto-reset at Midnight</p>
                  <p className="text-[10px] text-slate-500">Start fresh each day while keeping total stats</p>
                </div>
              </div>
              <div className={cn(
                "w-10 h-6 rounded-full transition-colors relative",
                autoReset ? "bg-emerald-500" : "bg-slate-700"
              )}>
                <div className={cn(
                  "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                  autoReset ? "left-5" : "left-1"
                )} />
              </div>
            </button>
          </div>
        </section>

        {/* Data Section */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold text-gold-500 uppercase tracking-widest">Data Management</h2>
          
          <div className="glass-panel p-4 rounded-xl space-y-4">
            <button 
              onClick={handleExport}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Download size={20} className="text-blue-400" />
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-200">Backup Data</p>
                  <p className="text-[10px] text-slate-500">Download a JSON file</p>
                </div>
              </div>
            </button>

            <div className="relative">
              <input 
                type="file" 
                accept=".json"
                onChange={handleImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-white/5 transition-colors pointer-events-none">
                <div className="flex items-center gap-3">
                  <Upload size={20} className="text-green-400" />
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-200">Restore Backup</p>
                    <p className="text-[10px] text-slate-500">Import from JSON file</p>
                  </div>
                </div>
                {importStatus === 'success' && <CheckCircle2 size={20} className="text-green-500" />}
              </div>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold text-red-500 uppercase tracking-widest">Danger Zone</h2>
          
          <div className="glass-panel p-4 rounded-xl border-red-500/20">
            <button 
              onClick={handleResetAll}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
            >
              <Trash2 size={20} />
              <div className="text-left">
                <p className="text-sm font-bold">Reset App</p>
                <p className="text-[10px] opacity-70">Delete all goals and history</p>
              </div>
            </button>
          </div>
        </section>
        
        <div className="text-center pt-8">
           <p className="text-xs text-slate-600">Tasbih PWA v1.0.0</p>
        </div>
      </div>
    </div>
  );
}

function ThemeButton({ theme, icon: Icon, label }: { theme: Theme; icon: typeof Sun; label: string }) {
  const { theme: currentTheme, setTheme } = useTheme();
  const isActive = currentTheme === theme;
  
  return (
    <button
      onClick={() => setTheme(theme)}
      className={cn(
        "flex-1 flex flex-col items-center gap-2 p-3 rounded-xl transition-all border",
        isActive 
          ? "bg-gold-500/10 border-gold-500/30 text-gold-400" 
          : "bg-slate-800/50 border-white/5 text-slate-400 hover:text-slate-200"
      )}
    >
      <Icon size={20} />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
