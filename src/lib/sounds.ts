export type NotificationSound = 'default' | 'gentle' | 'bell' | 'chime' | 'none' | 'custom';

const SOUND_STORAGE_KEY = 'tasbih-notification-sound';
const CUSTOM_SOUND_KEY = 'tasbih-custom-sound';
const MAX_DURATION_SECONDS = 30;

export function getSelectedSound(): NotificationSound {
  return (localStorage.getItem(SOUND_STORAGE_KEY) as NotificationSound) || 'default';
}

export function setSelectedSound(sound: NotificationSound): void {
  localStorage.setItem(SOUND_STORAGE_KEY, sound);
}

export async function saveCustomSound(file: File): Promise<string> {
  const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  
  const arrayBuffer = await file.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
  const sampleRate = audioBuffer.sampleRate;
  const channels = audioBuffer.numberOfChannels;
  
  const maxSamples = MAX_DURATION_SECONDS * sampleRate;
  const trimLength = Math.min(audioBuffer.length, maxSamples);
  
  const trimmedBuffer = audioContext.createBuffer(
    Math.min(channels, 2),
    trimLength,
    sampleRate
  );
  
  for (let channel = 0; channel < Math.min(channels, 2); channel++) {
    const sourceData = audioBuffer.getChannelData(channel);
    const destData = trimmedBuffer.getChannelData(channel);
    for (let i = 0; i < trimLength; i++) {
      destData[i] = sourceData[i];
    }
  }
  
  const wavBlob = audioBufferToWav(trimmedBuffer);
  const dataUrl = await blobToDataUrl(wavBlob);
  
  try {
    localStorage.setItem(CUSTOM_SOUND_KEY, dataUrl);
    return dataUrl;
  } catch {
    const monoBuffer = audioContext.createBuffer(1, trimLength, sampleRate);
    const sourceData = trimmedBuffer.getChannelData(0);
    const destData = monoBuffer.getChannelData(0);
    for (let i = 0; i < trimLength; i++) {
      destData[i] = sourceData[i];
    }
    
    const reducedWav = audioBufferToWav(monoBuffer);
    const reducedDataUrl = await blobToDataUrl(reducedWav);
    
    try {
      localStorage.setItem(CUSTOM_SOUND_KEY, reducedDataUrl);
      return reducedDataUrl;
    } catch {
      throw new Error('Audio file is too large even after trimming. Please try a shorter file.');
    }
  }
}

function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1;
  const bitDepth = 16;
  
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  
  const dataLength = buffer.length * blockAlign;
  const bufferLength = 44 + dataLength;
  
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);
  
  writeString(view, 0, 'RIFF');
  view.setUint32(4, bufferLength - 8, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);
  
  const channelData: Float32Array[] = [];
  for (let channel = 0; channel < numChannels; channel++) {
    channelData.push(buffer.getChannelData(channel));
  }
  
  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, channelData[channel][i]));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }
  
  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to convert audio'));
    reader.readAsDataURL(blob);
  });
}

export function getCustomSound(): string | null {
  return localStorage.getItem(CUSTOM_SOUND_KEY);
}

export function clearCustomSound(): void {
  localStorage.removeItem(CUSTOM_SOUND_KEY);
}

export function playNotificationSound(sound: NotificationSound = getSelectedSound()): void {
  if (sound === 'none') return;
  
  if (sound === 'custom') {
    const customSoundData = getCustomSound();
    if (customSoundData) {
      playCustomSound(customSoundData);
      vibrate('custom');
      return;
    }
  }
  
  const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  
  switch (sound) {
    case 'gentle':
      playGentleSound(audioContext);
      vibrate('gentle');
      break;
    case 'bell':
      playBellSound(audioContext);
      vibrate('bell');
      break;
    case 'chime':
      playChimeSound(audioContext);
      vibrate('chime');
      break;
    case 'default':
    default:
      playDefaultSound(audioContext);
      vibrate('default');
      break;
  }
}

function vibrate(pattern: 'default' | 'gentle' | 'bell' | 'chime' | 'custom'): void {
  const patterns: Record<string, number[]> = {
    default: [500, 200, 500, 200, 500, 200, 500, 200, 500],
    gentle: [800, 400, 800, 400, 800],
    bell: [300, 100, 300, 100, 300, 100, 300, 100, 300, 100, 300],
    chime: [200, 80, 200, 80, 200, 80, 200, 80, 200, 80, 200],
    custom: [500, 200, 500, 200, 500, 200, 500, 200, 500]
  };
  
  const vibrationPattern = patterns[pattern] || patterns.default;
  
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(vibrationPattern);
    } catch (error) {
      console.error('Vibration error:', error);
    }
  }
}

function playCustomSound(dataUrl: string): void {
  try {
    const audio = new Audio(dataUrl);
    audio.volume = 1.0;
    audio.loop = false;
    audio.play().catch(console.error);
  } catch (error) {
    console.error('Failed to play custom sound:', error);
  }
}

function playDefaultSound(ctx: AudioContext): void {
  const duration = 30;
  const interval = 0.5;
  const repeats = Math.floor(duration / interval);
  
  for (let i = 0; i < repeats; i++) {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, ctx.currentTime + i * interval);
    oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + i * interval + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime + i * interval);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * interval + 0.3);
    
    oscillator.start(ctx.currentTime + i * interval);
    oscillator.stop(ctx.currentTime + i * interval + 0.3);
  }
}

function playGentleSound(ctx: AudioContext): void {
  const duration = 30;
  const interval = 1;
  const repeats = Math.floor(duration / interval);
  
  for (let i = 0; i < repeats; i++) {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523, ctx.currentTime + i * interval);
    
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime + i * interval);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * interval + 0.5);
    
    oscillator.start(ctx.currentTime + i * interval);
    oscillator.stop(ctx.currentTime + i * interval + 0.5);
  }
}

function playBellSound(ctx: AudioContext): void {
  const duration = 30;
  const interval = 1.5;
  const repeats = Math.floor(duration / interval);
  const frequencies = [523, 659, 784];
  
  for (let r = 0; r < repeats; r++) {
    frequencies.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + r * interval + i * 0.1);
      
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime + r * interval + i * 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + r * interval + i * 0.1 + 0.4);
      
      oscillator.start(ctx.currentTime + r * interval + i * 0.1);
      oscillator.stop(ctx.currentTime + r * interval + i * 0.1 + 0.4);
    });
  }
}

function playChimeSound(ctx: AudioContext): void {
  const duration = 30;
  const interval = 1.2;
  const repeats = Math.floor(duration / interval);
  const notes = [659, 784, 880, 1047];
  
  for (let r = 0; r < repeats; r++) {
    notes.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + r * interval + i * 0.08);
      
      gainNode.gain.setValueAtTime(0.15, ctx.currentTime + r * interval + i * 0.08);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + r * interval + i * 0.08 + 0.3);
      
      oscillator.start(ctx.currentTime + r * interval + i * 0.08);
      oscillator.stop(ctx.currentTime + r * interval + i * 0.08 + 0.3);
    });
  }
}

export const SOUND_OPTIONS: { id: NotificationSound; name: string; description: string }[] = [
  { id: 'default', name: 'Default', description: 'Quick descending tone' },
  { id: 'gentle', name: 'Gentle', description: 'Soft single tone' },
  { id: 'bell', name: 'Bell', description: 'Three-note chime' },
  { id: 'chime', name: 'Chime', description: 'Ascending melody' },
  { id: 'custom', name: 'Custom', description: 'Your own audio file' },
  { id: 'none', name: 'None', description: 'Silent notification' }
];
