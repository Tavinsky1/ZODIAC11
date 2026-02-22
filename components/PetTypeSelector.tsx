import React from 'react';
import { PET_TYPES } from '../constants';
import { PetType } from '../types';
import { playClickSound } from '../utils/sound';

interface PetTypeSelectorProps {
  selectedPet: PetType | null;
  onPetSelect: (pet: PetType) => void;
}

const PetTypeSelector: React.FC<PetTypeSelectorProps> = ({ selectedPet, onPetSelect }) => {
  const handleSelect = (pet: PetType) => {
    onPetSelect(pet);
    playClickSound();
  };

  return (
    <div className="flex justify-center items-center gap-4 sm:gap-6 w-full max-w-lg mx-auto">
      {PET_TYPES.map((pet) => {
        const isSelected = selectedPet === pet.name;
        return (
          <button
            key={pet.name}
            type="button"
            onClick={() => handleSelect(pet.name)}
            className={`group w-full flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 transform relative overflow-hidden ${
              isSelected
                ? 'bg-purple-400/30 ring-2 ring-yellow-400 scale-110 shadow-lg shadow-yellow-400/20'
                : 'bg-white/10 hover:bg-white/20 hover:scale-105 hover:shadow-purple-500/20'
            }`}
            aria-pressed={isSelected}
            aria-label={`Select ${pet.name}`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br from-yellow-400/50 to-purple-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isSelected ? 'opacity-100' : ''}`} />
            <span className="text-4xl relative z-10">{pet.icon}</span>
            <span className={`mt-2 text-sm font-semibold transition-colors duration-300 relative z-10 ${
              isSelected ? 'text-yellow-300' : 'text-purple-300 group-hover:text-white'
            }`}>
              {pet.name}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default PetTypeSelector;
