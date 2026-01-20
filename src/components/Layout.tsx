import { Outlet } from 'react-router-dom';
import { Navigation } from './Navigation';
import { Toaster } from 'sonner';
import { useReminders } from '../hooks/useReminders';

export function Layout() {
  useReminders(); // Activate background logic

  return (
    <div className="min-h-screen bg-islamic-pattern text-slate-100 font-sans selection:text-gold-400">
      
      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/4 right-0 w-64 h-64 bg-emerald-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-64 bg-gold-600/5 blur-[100px]" />
      </div>

      <main className="max-w-md mx-auto min-h-screen relative pb-24">
        <Outlet />
      </main>
      
      <Navigation />
      <Toaster position="top-center" theme="dark" />
    </div>
  );
}
