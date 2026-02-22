import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ZodiacSign, Personality, Zodiac } from '../types';
import { ZODIAC_SIGNS } from '../constants';
import { getCompatibilityReading } from '../services/geminiService';
import ZodiacSelector from './ZodiacSelector';
import Loader from './Loader';
import HoroscopeCard from './HoroscopeCard';
import PersonalitySelector from './PersonalitySelector';
import { playSubmitSound, playRevealSound } from '../utils/sound';

interface CompatibilityViewProps {
  logAnalytics: (sign: ZodiacSign) => void;
  personality: Personality;
  onPersonalitySelect: (p: Personality) => void;
}

const CompatibilityView: React.FC<CompatibilityViewProps> = ({ logAnalytics, personality, onPersonalitySelect }) => {
  const [sign1, setSign1] = useState<ZodiacSign | null>(null);
  const [sign2, setSign2] = useState<ZodiacSign | null>(null);
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSign1Select = useCallback((sign: ZodiacSign) => {
    setSign1(sign);
    setError('');
    setResult('');
  }, []);
  
  const handleSign2Select = useCallback((sign: ZodiacSign) => {
    setSign2(sign);
    setError('');
    setResult('');
  }, []);

  const handlePersonalitySelect = useCallback((p: Personality) => {
    onPersonalitySelect(p);
    setResult('');
  }, [onPersonalitySelect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sign1 || !sign2) {
      setError('Please select two signs to check their cosmic connection.');
      return;
    }
    if (sign1 === sign2) {
      setError("Checking compatibility with yourself? That's deep, but maybe pick two different signs.");
      return;
    }

    playSubmitSound();
    setIsLoading(true);
    setError('');
    setResult('');

    try {
      const stream = getCompatibilityReading(sign1, sign2, personality);
      
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
        logAnalytics(sign1);
        logAnalytics(sign2);
      }
    } catch (err: any) {
      setError("Oops! The cosmos are a bit fuzzy right now. We couldn't retrieve your reading. Please try again later.");
      setIsLoading(false);
    }
  };

  const sign1Data = ZODIAC_SIGNS.find(s => s.name === sign1);
  const sign2Data = ZODIAC_SIGNS.find(s => s.name === sign2);

  return (
    <main className="w-full max-w-4xl mx-auto space-y-8 sm:space-y-10 animate-fade-in">
      <header className="space-y-2">
        <h1 className="text-5xl sm:text-7xl font-bold font-cinzel text-yellow-300 tracking-widest text-glow">
          Cosmic Compatibility
        </h1>
        <p className="text-md sm:text-lg text-purple-300 max-w-xl mx-auto">
          Will your stars align, or are you destined for cosmic chaos? Choose two signs to find out.
        </p>
      </header>
      
      <form onSubmit={handleSubmit} className="w-full space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-black/20 backdrop-blur-md border border-purple-400/20 p-6 rounded-2xl">
            <label className="text-xl font-cinzel text-purple-200 mb-4 block">1. Choose Sign One</label>
            <ZodiacSelector selectedSign={sign1} onSignSelect={handleSign1Select} />
          </section>
          <section className="bg-black/20 backdrop-blur-md border border-purple-400/20 p-6 rounded-2xl">
            <label className="text-xl font-cinzel text-purple-200 mb-4 block">2. Choose Sign Two</label>
            <ZodiacSelector selectedSign={sign2} onSignSelect={handleSign2Select} />
          </section>
        </div>
        
        <section className="bg-black/20 backdrop-blur-md border border-purple-400/20 p-6 rounded-2xl">
          <label className="text-xl font-cinzel text-purple-200 mb-4 block">3. Choose Your Guide</label>
          <PersonalitySelector selectedPersonality={personality} onPersonalitySelect={handlePersonalitySelect} />
        </section>

        <div>
          <button
            type="submit"
            disabled={isLoading || !sign1 || !sign2}
            className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 font-bold font-cinzel rounded-lg text-lg tracking-wider transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-400/40 disabled:bg-gray-500 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
          >
            {isLoading ? 'Reading the Stars...' : 'Check Compatibility'}
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
        {result && !isLoading && sign1Data && sign2Data && (
          <HoroscopeCard text={result} title={`${sign1} & ${sign2}`} icons={[sign1Data.icon, sign2Data.icon]} />
        )}
      </div>
    </main>
  );
};

export default CompatibilityView;