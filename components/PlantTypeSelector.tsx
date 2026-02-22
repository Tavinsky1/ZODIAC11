import React from 'react';
import { PlantType, Plant } from '../types';
import { PLANT_TYPES } from '../constants';

interface PlantTypeSelectorProps {
  selectedPlant: PlantType | null;
  onPlantSelect: (plant: PlantType) => void;
}

const PlantTypeSelector: React.FC<PlantTypeSelectorProps> = ({ selectedPlant, onPlantSelect }) => {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {PLANT_TYPES.map((plant: Plant) => {
        const isSelected = selectedPlant === plant.name;
        return (
          <button
            key={plant.name}
            type="button"
            onClick={() => onPlantSelect(plant.name)}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 w-24 h-24 
              ${isSelected
                ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300 scale-105 shadow-lg shadow-yellow-400/20'
                : 'border-purple-400/30 bg-purple-900/20 text-purple-200 hover:border-purple-400/70 hover:bg-purple-800/30'
              }`}
            aria-pressed={isSelected}
          >
            <span className="text-3xl mb-1">{plant.icon}</span>
            <span className="text-xs font-cinzel font-bold leading-tight text-center">{plant.name}</span>
          </button>
        );
      })}
    </div>
  );
};

export default PlantTypeSelector;
