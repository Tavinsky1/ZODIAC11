import React from 'react';
import { AnalyticsData } from '../types';
import { ZODIAC_SIGNS } from '../constants';

interface AdminDashboardProps {
  analyticsData: AnalyticsData;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ analyticsData, onLogout }) => {
  const { totalGenerations, generationsBySign } = analyticsData;
  // Fix: Ensure only numbers are passed to Math.max by filtering out undefined values.
  const maxSignCount = Math.max(...Object.values(generationsBySign).filter((v): v is number => v !== undefined), 0);

  const sortedSigns = ZODIAC_SIGNS.map(sign => ({
    ...sign,
    count: generationsBySign[sign.name] || 0
  })).sort((a, b) => b.count - a.count);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 animate-fade-in">
      <main className="w-full max-w-4xl mx-auto space-y-8 bg-black/20 backdrop-blur-md border border-purple-400/20 p-6 rounded-2xl">
        <header className="flex justify-between items-center">
          <h1 className="text-4xl font-bold font-cinzel text-yellow-300 tracking-widest text-glow">
            Admin Dashboard
          </h1>
          <button
            onClick={onLogout}
            className="px-4 py-2 border-2 border-purple-400/50 text-purple-200 font-bold font-cinzel rounded-lg text-sm tracking-wider transform transition-all duration-300 hover:bg-purple-400/20 hover:scale-105"
          >
            Logout
          </button>
        </header>

        <section className="bg-purple-900/30 p-6 rounded-lg text-center">
            <h2 className="text-lg font-cinzel text-purple-300 tracking-wider">Total Horoscopes Generated</h2>
            <p className="text-6xl font-bold text-yellow-300 text-glow">{totalGenerations}</p>
        </section>

        <section className="bg-purple-900/30 p-6 rounded-lg">
            <h2 className="text-2xl font-cinzel text-purple-200 mb-6 text-center tracking-wider">Usage by Sign</h2>
            <div className="space-y-4">
                {sortedSigns.map(sign => {
                    const percentage = maxSignCount > 0 ? (sign.count / maxSignCount) * 100 : 0;
                    return (
                        <div key={sign.name} className="flex items-center gap-4 group">
                           <div className="w-28 flex items-center gap-2">
                             <span className="w-6 h-6 flex items-center justify-center text-xl flex-shrink-0">{sign.icon}</span>
                             <span className="text-md font-semibold text-purple-300 truncate">{sign.name}</span>
                           </div>
                           <div className="flex-1 bg-black/30 rounded-full h-6 overflow-hidden">
                                <div 
                                    className="bg-gradient-to-r from-yellow-400 to-amber-500 h-full rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${percentage}%` }}
                                ></div>
                           </div>
                           <span className="w-12 text-right font-bold text-lg text-yellow-300">{sign.count}</span>
                        </div>
                    )
                })}
            </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;