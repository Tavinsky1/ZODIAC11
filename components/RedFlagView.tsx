import React, { useState, useCallback } from 'react';
import { ZodiacSign, Personality } from '../types';
import { ZODIAC_SIGNS } from '../constants';
import { getRedFlagReading } from '../services/geminiService';
import ZodiacSelector from './ZodiacSelector';
import Loader from './Loader';
import HoroscopeCard from './HoroscopeCard';
import PersonalitySelector from './PersonalitySelector';
import { playSubmitSound, playRevealSound } from '../utils/sound';

interface RedFlagViewProps {
  logAnalytics: (sign: ZodiacSign) => void;
  personality: Personality;
  onPersonalitySelect: (p: Personality) => void;
}

const RedFlagView: React.FC<RedFlagViewProps> = ({ logAnalytics, personality, onPersonalitySelect }) => {
  const [sign1, setSign1] = useState<ZodiacSign | null>(null);
  const [sign2, setSign2] = useState<ZodiacSign | null>(null);
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handlePersonalitySelect = useCallback((p: Personality) => {
    onPersonalitySelect(p);
    setResult('');
  }, [onPersonalitySelect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sign1 || !sign2) {
      setError('Select both signs to detect the red flags.');
      return;
    }
    playSubmitSound();
    setIsLoading(true);
    setError('');
    setResult('');
    try {
      const stream = getRedFlagReading(sign1, sign2, personality);
      let firstChunk = true;
      let fullResponse = '';
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
      }
    } catch (err: any) {
      setError('The red flags were too numerous to process. Try again.');
      setIsLoading(false);
    }
  };

  const sign1Data = ZODIAC_SIGNS.find(s => s.name === sign1);
  const sign2Data = ZODIAC_SIGNS.find(s => s.name === sign2);

  return (
    <main className="w-full max-w-4xl mx-auto space-y-8 sm:space-y-10 animate-fade-in">
      <header className="space-y-2">
        <h1 className="text-5xl sm:text-7xl font-bold font-cinzel text-yellow-300 tracking-widest text-glow">
          🚩 Red Flag Detector
        </h1>
        <p className="text-md sm:text-lg text-purple-300 max-w-xl mx-auto">
          The stars don't lie. Find out exactly how this relationship will implode.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="w-full space-y-8">
        <section className="bg-black/20 backdrop-blur-md border border-purple-400/20 p-6 rounded-2xl">
          <label className="text-xl font-cinzel text-purple-200 mb-4 block">
            1. Your Sign {sign1Data && <span className="text-yellow-300">{sign1Data.icon} {sign1}</span>}
          </label>
          <ZodiacSelector selectedSign={sign1} onSignSelect={(s) => { setSign1(s); setResult(''); setError(''); }} />
        </section>

        <div className="flex items-center justify-center">
          <span className="text-4xl animate-pulse">💥</span>
          <span className="mx-4 text-purple-400 font-cinzel text-xl">VS</span>
          <span className="text-4xl animate-pulse">💥</span>
        </div>

        <section className="bg-black/20 backdrop-blur-md border border-purple-400/20 p-6 rounded-2xl">
          <label className="text-xl font-cinzel text-purple-200 mb-4 block">
            2. Their Sign {sign2Data && <span className="text-red-400">{sign2Data.icon} {sign2}</span>}
          </label>
          <ZodiacSelector selectedSign={sign2} onSignSelect={(s) => { setSign2(s); setResult(''); setError(''); }} />
        </section>

        <section className="bg-black/20 backdrop-blur-md border border-purple-400/20 p-6 rounded-2xl">
          <label className="text-xl font-cinzel text-purple-200 mb-4 block">3. Choose Your Roast Level</label>
          <PersonalitySelector selectedPersonality={personality} onPersonalitySelect={handlePersonalitySelect} />
        </section>

        <div>
          <button
            type="submit"
            disabled={isLoading || !sign1 || !sign2}
            className="px-8 py-4 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold font-cinzel rounded-lg text-lg tracking-wider transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/40 disabled:bg-gray-500 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
          >
            {isLoading ? 'Scanning for Disasters...' : '🚩 Detect Red Flags'}
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
          <HoroscopeCard
            text={result}
            title={`${sign1Data.icon} ${sign1} × ${sign2Data.icon} ${sign2}`}
            icons={['🚩']}
          />
        )}
      </div>
    </main>
  );
};

export default RedFlagView;
