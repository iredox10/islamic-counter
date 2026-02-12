import { format } from 'date-fns';
import { gregorianToHijri } from './hijri';

export interface ShareCardData {
  title: string;
  count: number;
  targetCount: number;
  completedAt: Date;
  streak?: number;
  totalLifetime?: number;
}

export function generateShareCard(data: ShareCardData): string {
  const hijriDate = gregorianToHijri(data.completedAt);
  const completionPercent = Math.round((data.count / data.targetCount) * 100);
  
  const svg = `
<svg width="400" height="500" viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a"/>
      <stop offset="100%" style="stop-color:#020617"/>
    </linearGradient>
    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#fbbf24"/>
      <stop offset="100%" style="stop-color:#d97706"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="400" height="500" fill="url(#bgGradient)"/>
  
  <!-- Decorative circles -->
  <circle cx="50" cy="50" r="100" fill="rgba(212, 175, 55, 0.05)" />
  <circle cx="350" cy="450" r="80" fill="rgba(212, 175, 55, 0.03)" />
  
  <!-- Border -->
  <rect x="10" y="10" width="380" height="480" rx="20" fill="none" stroke="rgba(212, 175, 55, 0.2)" stroke-width="2"/>
  
  <!-- Header -->
  <text x="200" y="60" text-anchor="middle" fill="#d4af37" font-family="serif" font-size="14" letter-spacing="4">الْحَمْدُ لِلَّهِ</text>
  <text x="200" y="90" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="12" letter-spacing="2">ALHAMDULILLAH</text>
  
  <!-- Achievement Icon -->
  <circle cx="200" cy="180" r="60" fill="rgba(212, 175, 55, 0.1)" stroke="url(#goldGradient)" stroke-width="3"/>
  <text x="200" y="195" text-anchor="middle" fill="url(#goldGradient)" font-size="50">🏆</text>
  
  <!-- Title -->
  <text x="200" y="280" text-anchor="middle" fill="#f8fafc" font-family="serif" font-size="22" font-weight="bold">${escapeXml(data.title)}</text>
  
  <!-- Count -->
  <text x="200" y="340" text-anchor="middle" fill="url(#goldGradient)" filter="url(#glow)" font-family="serif" font-size="48" font-weight="bold">${data.count.toLocaleString()}</text>
  <text x="200" y="365" text-anchor="middle" fill="#64748b" font-family="sans-serif" font-size="14">of ${data.targetCount.toLocaleString()} (${completionPercent}%)</text>
  
  <!-- Stats Row -->
  ${data.streak ? `
  <text x="100" y="420" text-anchor="middle" fill="#f97316" font-size="16">🔥</text>
  <text x="100" y="445" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="12">${data.streak} day streak</text>
  ` : ''}
  
  ${data.totalLifetime ? `
  <text x="300" y="420" text-anchor="middle" fill="#d4af37" font-size="16">✨</text>
  <text x="300" y="445" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="12">${data.totalLifetime.toLocaleString()} total</text>
  ` : ''}
  
  <!-- Footer -->
  <line x1="50" y1="470" x2="350" y2="470" stroke="rgba(148, 163, 184, 0.2)" stroke-width="1"/>
  <text x="200" y="490" text-anchor="middle" fill="#64748b" font-family="sans-serif" font-size="10">${format(data.completedAt, 'MMMM d, yyyy')} • ${hijriDate.formatted}</text>
  
  <!-- App branding -->
  <text x="380" y="490" text-anchor="end" fill="#475569" font-family="sans-serif" font-size="9">Tasbih PWA</text>
</svg>
  `.trim();
  
  return svg;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function shareAsImage(data: ShareCardData): Promise<void> {
  const svg = generateShareCard(data);
  
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 1000;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  const img = new Image();
  const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  
  return new Promise((resolve, reject) => {
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 800, 1000);
      URL.revokeObjectURL(url);
      
      canvas.toBlob(async (blob) => {
        if (!blob) {
          reject(new Error('Could not create blob'));
          return;
        }
        
        const file = new File([blob], `tasbih-achievement-${Date.now()}.png`, { type: 'image/png' });
        
        if (navigator.share && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'Tasbih Achievement',
              text: `Completed ${data.title}: ${data.count} counts!`
            });
            resolve();
          } catch (err) {
            if ((err as Error).name !== 'AbortError') {
              reject(err);
            } else {
              resolve();
            }
          }
        } else {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `tasbih-achievement-${Date.now()}.png`;
          link.click();
          resolve();
        }
      }, 'image/png');
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not load SVG'));
    };
    
    img.src = url;
  });
}

export async function shareAsText(data: ShareCardData): Promise<void> {
  const hijriDate = gregorianToHijri(data.completedAt);
  const text = `🏆 Achievement Unlocked!\n\n✨ ${data.title}\n📊 ${data.count.toLocaleString()} counts completed\n📅 ${format(data.completedAt, 'MMMM d, yyyy')} (${hijriDate.formatted})\n\n#TasbihPWA #Dhikr #Islamic`;
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Tasbih Achievement',
        text
      });
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        throw err;
      }
    }
  } else {
    await navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  }
}
