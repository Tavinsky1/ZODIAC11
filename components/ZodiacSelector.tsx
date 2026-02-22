import React from 'react';
import { ZODIAC_SIGNS } from '../constants';
import { ZodiacSign } from '../types';
import { playClickSound } from '../utils/sound';

interface ZodiacSelectorProps {
  selectedSign: ZodiacSign | null;
  onSignSelect: (sign: ZodiacSign) => void;
}

const ZodiacSelector: React.FC<ZodiacSelectorProps> = ({ selectedSign, onSignSelect }) => {
  const handleSelect = (sign: ZodiacSign) => {
    onSignSelect(sign);
    playClickSound();
  };

  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 gap-4 w-full max-w-2xl mx-auto">
      {ZODIAC_SIGNS.map((sign) => {
        const isSelected = selectedSign === sign.name;
        return (
          <button
            key={sign.name}
            onClick={() => handleSelect(sign.name)}
            className={`group aspect-square flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 transform relative overflow-hidden ${
              isSelected
                ? 'bg-purple-400/30 ring-2 ring-yellow-400 scale-110 shadow-lg shadow-yellow-400/20'
                : 'bg-white/10 hover:bg-white/20 hover:scale-105 hover:shadow-purple-500/20'
            }`}
            aria-pressed={isSelected}
            aria-label={`Select ${sign.name}`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br from-yellow-400/50 to-purple-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isSelected ? 'opacity-100' : ''}`} />
            <span className="text-4xl relative z-10 filter drop-shadow-lg">{sign.icon}</span>
            <span className={`mt-1 text-xs font-semibold transition-colors duration-300 relative z-10 ${
              isSelected ? 'text-yellow-300' : 'text-purple-300 group-hover:text-white'
            }`}>
              {sign.name}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default ZodiacSelector;
