import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ZodiacSign, Personality, PetType } from '../types';
import { ZODIAC_SIGNS, PET_TYPES } from '../constants';
import { getPetHoroscope } from '../services/geminiService';
import ZodiacSelector from './ZodiacSelector';
import Loader from './Loader';
import HoroscopeCard from './HoroscopeCard';
import PersonalitySelector from './PersonalitySelector';
import PetTypeSelector from './PetTypeSelector';
import { playSubmitSound, playRevealSound } from '../utils/sound';

interface PetHoroscopeViewProps {
  logAnalytics: (sign: ZodiacSign) => void;
  personality: Personality;
  onPersonalitySelect: (p: Personality) => void;
}

const PetHoroscopeView: React.FC<PetHoroscopeViewProps> = ({ logAnalytics, personality, onPersonalitySelect }) => {
  const [selectedPet, setSelectedPet] = useState<PetType | null>(null);
  const [selectedSign, setSelectedSign] = useState<ZodiacSign | null>(null);
  const [question, setQuestion] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handlePetSelect = useCallback((pet: PetType) => {
    setSelectedPet(pet);
    setError('');
    setResult('');
  }, []);

  const handleSignSelect = useCallback((sign: ZodiacSign) => {
    setSelectedSign(sign);
    setError('');
    setResult('');
  }, []);

  const handlePersonalitySelect = useCallback((p: Personality) => {
    onPersonalitySelect(p);
    setResult('');
  }, [onPersonalitySelect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPet || !selectedSign || !question.trim()) {
      setError('Please choose a pet, their sign, and ask a question.');
      return;
    }

    playSubmitSound();
    setIsLoading(true);
    setError('');
    setResult('');

    try {
      const stream = getPetHoroscope(selectedPet, selectedSign, question, personality);
      
      let firstChunk = true;
      let fullResponse = "";

      for await (const chunk of stream) {
        if (firstChunk) {
          setIsLoading(false);
          playRevealSound();
          firstChunk = false;
        }
        fullResponse += chunk;
        setResult(fullResponse);
      }
      
      if (!fullResponse.includes('### Cosmic Connection Error')) {
        logAnalytics(selectedSign); // Log analytics for the pet's sign
      }

    } catch (err: any) {
      setError("Oops! The cosmos are a bit fuzzy right now. We couldn't retrieve your pet's horoscope. Please try again later.");
      setIsLoading(false);
    }
  };

  const petData = PET_TYPES.find(p => p.name === selectedPet);
  const signData = ZODIAC_SIGNS.find(s => s.name === selectedSign);

  return (
    <main className="w-full max-w-4xl mx-auto space-y-8 sm:space-y-10 animate-fade-in">
      <header className="space-y-2">
        <h1 className="text-5xl sm:text-7xl font-bold font-cinzel text-yellow-300 tracking-widest text-glow">
          Pet Horoscope
        </h1>
        <p className="text-md sm:text-lg text-purple-300 max-w-xl mx-auto">
          What is your furry, scaly, or feathery friend really thinking? Let's decode their cosmic agenda.
        </p>
      </header>
      
      <form onSubmit={handleSubmit} className="w-full space-y-8">
        <section className="bg-black/20 backdrop-blur-md border border-purple-400/20 p-6 rounded-2xl">
          <label className="text-xl font-cinzel text-purple-200 mb-4 block">1. Choose Your Pet</label>
          <PetTypeSelector selectedPet={selectedPet} onPetSelect={handlePetSelect} />
        </section>

        <section className="bg-black/20 backdrop-blur-md border border-purple-400/20 p-6 rounded-2xl">
          <label className="text-xl font-cinzel text-purple-200 mb-4 block">2. Choose Their Sign</label>
          <ZodiacSelector selectedSign={selectedSign} onSignSelect={handleSignSelect} />
        </section>

        <section className="bg-black/20 backdrop-blur-md border border-purple-400/20 p-6 rounded-2xl">
          <label htmlFor="pet-question" className="text-xl font-cinzel text-purple-200 mb-4 block">3. Ask a Burning Question</label>
           <textarea
              id="pet-question"
              value={question}
              onChange={(e) => { setQuestion(e.target.value); setError(''); }}
              placeholder="e.g., Why does my cat stare at the wall at 3 AM?"
              className="w-full max-w-2xl mx-auto bg-purple-900/30 border-2 border-purple-400/50 rounded-lg p-4 text-white placeholder-purple-300/60 focus:ring-2 focus:ring-yellow-400 focus:outline-none transition-all duration-300 min-h-[100px] resize-none"
              rows={3}
              disabled={isLoading}
          />
        </section>

        <section className="bg-black/20 backdrop-blur-md border border-purple-400/20 p-6 rounded-2xl">
          <label className="text-xl font-cinzel text-purple-200 mb-4 block">4. Choose Your Guide</label>
          <PersonalitySelector selectedPersonality={personality} onPersonalitySelect={handlePersonalitySelect} />
        </section>

        <div>
          <button
            type="submit"
            disabled={isLoading || !selectedPet || !selectedSign || !question.trim()}
            className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 font-bold font-cinzel rounded-lg text-lg tracking-wider transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-400/40 disabled:bg-gray-500 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
          >
            {isLoading ? 'Decoding Barks & Meows...' : 'Reveal Pet Secrets'}
          </button>
        </div>
      </form>
      
      <div className="min-h-[250px] flex items-center justify-center w-full">
        {isLoading && <Loader />}
        {error && !isLoading && (
          <div className="bg-red-900/50 border border-red-500/50 text-red-300 p-4 rounded-lg animate-fade-in max-w-md" role="alert">
            <p className="font-bold">Cosmic Interference!</p>
            <p>{error}</p>
          </div>
        )}
        {result && !isLoading && petData && signData && (
          <HoroscopeCard text={result} title={`${petData.name}'s Cosmic Agenda`} icons={[petData.icon, signData.icon]} />
        )}
      </div>
    </main>
  );
};

export default PetHoroscopeView;