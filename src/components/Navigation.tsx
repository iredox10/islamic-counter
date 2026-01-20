import { Link, useLocation } from 'react-router-dom';
import { Home, Target, BarChart2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

export function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Tasbih' },
    { path: '/targets', icon: Target, label: 'Goals' },
    { path: '/stats', icon: BarChart2, label: 'Progress' },
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav className="glass-panel rounded-full px-6 py-3 flex items-center gap-8 pointer-events-auto shadow-2xl shadow-black/50">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center justify-center w-12 h-12"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-gold-500/10 rounded-xl -z-10"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon 
                size={24} 
                className={cn(
                  "transition-all duration-300",
                  isActive ? "text-gold-400 drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]" : "text-slate-400 hover:text-slate-200"
                )} 
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              <span className={cn(
                "text-[10px] font-medium mt-1 transition-colors",
                isActive ? "text-gold-400" : "text-slate-500"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
