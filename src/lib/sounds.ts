export type NotificationSound = 'default' | 'gentle' | 'bell' | 'chime' | 'none';

const SOUND_STORAGE_KEY = 'tasbih-notification-sound';

export function getSelectedSound(): NotificationSound {
  return (localStorage.getItem(SOUND_STORAGE_KEY) as NotificationSound) || 'default';
}

export function setSelectedSound(sound: NotificationSound): void {
  localStorage.setItem(SOUND_STORAGE_KEY, sound);
}

export function playNotificationSound(sound: NotificationSound = getSelectedSound()): void {
  if (sound === 'none') return;
  
  const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  
  switch (sound) {
    case 'gentle':
      playGentleSound(audioContext);
      break;
    case 'bell':
      playBellSound(audioContext);
      break;
    case 'chime':
      playChimeSound(audioContext);
      break;
    case 'default':
    default:
      playDefaultSound(audioContext);
      break;
  }
}

function playDefaultSound(ctx: AudioContext): void {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(880, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
  
  gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.3);
}

function playGentleSound(ctx: AudioContext): void {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(523, ctx.currentTime);
  
  gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.5);
}

function playBellSound(ctx: AudioContext): void {
  const frequencies = [523, 659, 784];
  
  frequencies.forEach((freq, i) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
    
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.4);
    
    oscillator.start(ctx.currentTime + i * 0.1);
    oscillator.stop(ctx.currentTime + i * 0.1 + 0.4);
  });
}

function playChimeSound(ctx: AudioContext): void {
  const notes = [659, 784, 880, 1047];
  
  notes.forEach((freq, i) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
    
    gainNode.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.08);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.3);
    
    oscillator.start(ctx.currentTime + i * 0.08);
    oscillator.stop(ctx.currentTime + i * 0.08 + 0.3);
  });
}

export const SOUND_OPTIONS: { id: NotificationSound; name: string; description: string }[] = [
  { id: 'default', name: 'Default', description: 'Quick descending tone' },
  { id: 'gentle', name: 'Gentle', description: 'Soft single tone' },
  { id: 'bell', name: 'Bell', description: 'Three-note chime' },
  { id: 'chime', name: 'Chime', description: 'Ascending melody' },
  { id: 'none', name: 'None', description: 'Silent notification' }
];
