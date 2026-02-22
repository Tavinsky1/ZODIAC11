import React from 'react';
import { View } from '../types';

interface NavbarProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const navItems: { id: View; label: string; icon: string; }[] = [
  { id: 'horoscope', label: 'Horoscope', icon: '🔮' },
  { id: 'petHoroscope', label: 'Pet Horoscope', icon: '🐾' },
  { id: 'dream', label: 'Dream Decoder', icon: '🌙' },
  // { id: 'compatibility', label: 'Compatibility' },
];

const Navbar: React.FC<NavbarProps> = ({ currentView, onViewChange }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-slate-900/50 backdrop-blur-md border-b border-purple-400/20">
      <nav className="container mx-auto px-4 sm:px-6 flex justify-between items-center h-20">
        <div className="text-xl sm:text-2xl font-bold font-cinzel text-yellow-300 text-glow">
          ZodiacLOL
        </div>
        <div className="flex items-center space-x-1 sm:space-x-4">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`relative flex items-center justify-center transition-colors duration-300 rounded-lg 
                           w-14 h-14 sm:w-auto sm:h-auto sm:px-3 sm:py-2
                           focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-slate-900
                           ${
                  isActive
                    ? 'text-yellow-300'
                    : 'text-purple-300 hover:text-white hover:bg-purple-500/10'
                }`}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
                title={item.label}
              >
                <span className="text-3xl sm:hidden">{item.icon}</span>
                <span className="hidden sm:inline font-cinzel tracking-wider sm:text-base">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;