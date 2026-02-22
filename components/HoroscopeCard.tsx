import React from 'react';

interface HoroscopeCardProps {
  text: string;
  title: string;
  icons: string[];
}

const HoroscopeCard: React.FC<HoroscopeCardProps> = ({ text, title, icons }) => {
  return (
    // Outer div for the golden gradient border
    <div className="w-full max-w-2xl mx-auto rounded-2xl p-0.5 bg-gradient-to-br from-yellow-400 to-amber-600 shadow-2xl shadow-purple-500/40 animate-fade-in">
      {/* Inner div for the solid purple content area */}
      <div className="bg-purple-950 rounded-[15px] p-6 sm:p-8">
        <div className="flex flex-col items-center justify-center -mt-16 mb-4">
          <div className="flex items-center justify-center -space-x-4">
            {icons.map((icon, index) => (
              <div key={index} className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center ring-2 ring-yellow-400/50 relative" style={{ zIndex: icons.length - index }}>
                <span className="text-5xl filter drop-shadow-lg">{icon}</span>
              </div>
            ))}
          </div>
        </div>
        <h3 className="text-2xl font-cinzel text-yellow-300 mb-4 tracking-wider text-center">{title}</h3>
        <p className="text-lg text-slate-200 whitespace-pre-wrap leading-relaxed text-center">
          {text}
        </p>
      </div>
    </div>
  );
};

export default HoroscopeCard;