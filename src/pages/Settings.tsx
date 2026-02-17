import { db } from '../lib/db';
import { Download, Upload, Trash2, CheckCircle2, Sun, Moon, Monitor, Bell, BellOff, Clock, RefreshCw, Send, Volume2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme, type Theme } from '../lib/ThemeContext';
import { cn } from '../lib/utils';
import { getStoredReminders, saveReminders, updateReminder, scheduleReminderNotification, cancelReminderNotification, type DailyReminder } from '../lib/reminders';
import { 
  requestNotificationPermission, 
  subscribeToPush, 
  unsubscribeFromPush, 
  isPushSupported, 
  getNotificationPermission,
  saveSubscriptionToBackend,
  removeSubscriptionFromBackend,
  sendTestNotification
} from '../lib/pushNotifications';
import { getSelectedSound, setSelectedSound, playNotificationSound, SOUND_OPTIONS, type NotificationSound, saveCustomSound, getCustomSound, clearCustomSound } from '../lib/sounds';

export function Settings() {
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [reminders, setReminders] = useState<DailyReminder[]>([]);
  const [autoReset, setAutoReset] = useState(() => localStorage.getItem('auto-reset') === 'true');
  const [pushEnabled, setPushEnabled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [selectedSound, setSelectedSoundState] = useState<NotificationSound>(() => getSelectedSound());
  const [hasCustomSound, setHasCustomSound] = useState(() => !!getCustomSound());

  useEffect(() => {
    setReminders(getStoredReminders());
    setNotificationPermission(getNotificationPermission());
    checkPushSubscription();
  }, []);

  const checkPushSubscription = async () => {
    const stored = localStorage.getItem('push-subscription');
    setPushEnabled(!!stored);
  };

  const handleToggleAutoReset = () => {
    const newValue = !autoReset;
    setAutoReset(newValue);
    localStorage.setItem('auto-reset', String(newValue));
  };

  const handleTogglePush = async () => {
    if (pushEnabled) {
      await removeSubscriptionFromBackend();
      await unsubscribeFromPush();
      setPushEnabled(false);
    } else {
      const permission = await requestNotificationPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        const subscription = await subscribeToPush();
        if (subscription) {
          const activeReminders = reminders.filter(r => r.enabled).map(r => ({
            id: r.id,
            name: r.name,
            time: r.time,
            enabled: r.enabled
          }));
          await saveSubscriptionToBackend(subscription, activeReminders);
          setPushEnabled(true);
        }
      }
    }
  };

  const handleToggleReminder = async (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    const newEnabled = !reminder?.enabled;
    
    if (newEnabled && notificationPermission !== 'granted') {
      const permission = await requestNotificationPermission();
      setNotificationPermission(permission);
      if (permission !== 'granted') return;
    }
    
    const updated = updateReminder(reminders, id, { enabled: newEnabled });
    setReminders(updated);
    saveReminders(updated);
    
    if (newEnabled) {
      scheduleReminderNotification(updated.find(r => r.id === id)!);
    } else {
      cancelReminderNotification(id);
    }
  };

  const handleTimeChange = (id: string, time: string) => {
    const updated = updateReminder(reminders, id, { time });
    setReminders(updated);
    saveReminders(updated);
    
    const reminder = updated.find(r => r.id === id);
    if (reminder?.enabled) {
      scheduleReminderNotification(reminder);
    }
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

        {/* Push Notifications Section */}
        {isPushSupported() && (
          <section className="space-y-4">
            <h2 className="text-xs font-bold text-gold-500 uppercase tracking-widest">Push Notifications</h2>
            
            <div className="glass-panel p-4 rounded-xl space-y-3">
              <button 
                onClick={handleTogglePush}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg transition-colors",
                    pushEnabled ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-700/50 text-slate-500"
                  )}>
                    <Bell size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-slate-200">Push Notifications</p>
                    <p className="text-[10px] text-slate-500">
                      {notificationPermission === 'denied' 
                        ? 'Blocked - Enable in browser settings'
                        : pushEnabled 
                          ? 'Notifications enabled'
                          : 'Get reminders even when app is closed'}
                    </p>
                  </div>
                </div>
                <div className={cn(
                  "w-10 h-6 rounded-full transition-colors relative",
                  pushEnabled ? "bg-emerald-500" : "bg-slate-700"
                )}>
                  <div className={cn(
                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                    pushEnabled ? "left-5" : "left-1"
                  )} />
                </div>
              </button>
              
              {pushEnabled && (
                <button
                  onClick={async () => {
                    const success = await sendTestNotification();
                    if (!success) {
                      alert('Failed to send test notification. Make sure notifications are allowed.');
                    }
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-gold-500/10 hover:bg-gold-500/20 border border-gold-500/20 transition-colors"
                >
                  <Send size={18} className="text-gold-400" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gold-400">Send Test Notification</p>
                    <p className="text-[10px] text-slate-500">Verify notifications are working</p>
                  </div>
                </button>
              )}
              
              {notificationPermission === 'granted' && !pushEnabled && (
                <button
                  onClick={async () => {
                    const success = await sendTestNotification();
                    if (!success) {
                      alert('Failed to send test notification.');
                    }
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-white/5 transition-colors"
                >
                  <Send size={18} className="text-slate-400" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-slate-300">Send Test Notification</p>
                    <p className="text-[10px] text-slate-500">Verify local notifications work</p>
                  </div>
                </button>
              )}
            </div>
          </section>
        )}

        {/* Notification Sound Section */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold text-gold-500 uppercase tracking-widest">Notification Sound</h2>
          
          <div className="glass-panel p-4 rounded-xl space-y-2">
            {SOUND_OPTIONS.filter(s => s.id !== 'custom' || hasCustomSound).map((sound) => (
              <button
                key={sound.id}
                onClick={() => {
                  setSelectedSoundState(sound.id);
                  setSelectedSound(sound.id);
                  if (sound.id !== 'none') {
                    playNotificationSound(sound.id);
                  }
                }}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-lg transition-colors",
                  selectedSound === sound.id 
                    ? "bg-gold-500/10 border border-gold-500/30" 
                    : "bg-slate-800/30 border border-transparent hover:bg-slate-800/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <Volume2 size={18} className={selectedSound === sound.id ? "text-gold-400" : "text-slate-500"} />
                  <div className="text-left">
                    <p className={cn("text-sm font-medium", selectedSound === sound.id ? "text-gold-400" : "text-slate-300")}>
                      {sound.name}
                    </p>
                    <p className="text-[10px] text-slate-500">{sound.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {sound.id === 'custom' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearCustomSound();
                        setHasCustomSound(false);
                        if (selectedSound === 'custom') {
                          setSelectedSoundState('default');
                          setSelectedSound('default');
                        }
                      }}
                      className="p-1 rounded hover:bg-red-500/20 text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                  {selectedSound === sound.id && (
                    <CheckCircle2 size={16} className="text-gold-400" />
                  )}
                </div>
              </button>
            ))}
            
            {/* Upload Custom Sound */}
            <div className="pt-2 border-t border-white/5">
              <div className="relative">
                <input 
                  type="file" 
                  accept="audio/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        await saveCustomSound(file);
                        setHasCustomSound(true);
                        setSelectedSoundState('custom');
                        setSelectedSound('custom');
                        playNotificationSound('custom');
                      } catch {
                        alert('Failed to save audio file. Please try a smaller file.');
                      }
                    }
                    e.target.value = '';
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 border border-dashed border-slate-600 transition-colors">
                  <Upload size={18} className="text-slate-500" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-slate-300">
                      {hasCustomSound ? 'Replace Custom Sound' : 'Upload Custom Sound'}
                    </p>
                    <p className="text-[10px] text-slate-500">MP3, WAV, OGG (auto-trimmed to 5 seconds)</p>
                  </div>
                </div>
              </div>
            </div>
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
