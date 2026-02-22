import React, { useState, useCallback } from 'react';
import { Personality } from '../types';
import { getMercuryExcuse } from '../services/geminiService';
import Loader from './Loader';
import HoroscopeCard from './HoroscopeCard';
import PersonalitySelector from './PersonalitySelector';
import { playSubmitSound, playRevealSound } from '../utils/sound';

const QUICK_SITUATIONS = [
  "didn't text back for 3 days",
  "missed an important deadline",
  "sent an embarrassing email to the wrong person",
  "forgot my best friend's birthday",
  "spent all my savings on something stupid",
  "ghosted someone I actually liked",
];

interface MercuryExcuseViewProps {
  logGeneration: () => void;
  personality: Personality;
  onPersonalitySelect: (p: Personality) => void;
}

const MercuryExcuseView: React.FC<MercuryExcuseViewProps> = ({ logGeneration, personality, onPersonalitySelect }) => {
  const [situation, setSituation] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handlePersonalitySelect = useCallback((p: Personality) => {
    onPersonalitySelect(p);
    setResult('');
  }, [onPersonalitySelect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!situation.trim()) {
      setError('Tell the cosmos what you need an excuse for.');
      return;
    }
    playSubmitSound();
    setIsLoading(true);
    setError('');
    setResult('');
    try {
      const stream = getMercuryExcuse(situation, personality);
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
        logGeneration();
      }
    } catch (err: any) {
      setError('Mercury ate your excuse. Try again.');
      setIsLoading(false);
    }
  };

  return (
    <main className="w-full max-w-4xl mx-auto space-y-8 sm:space-y-10 animate-fade-in">
      <header className="space-y-2">
        <h1 className="text-5xl sm:text-7xl font-bold font-cinzel text-yellow-300 tracking-widest text-glow">
          ☿ Mercury Excuse
        </h1>
        <p className="text-md sm:text-lg text-purple-300 max-w-xl mx-auto">
          Mercury is ALWAYS in retrograde. It's never your fault. Let the cosmos explain.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="w-full space-y-8">
        <section className="bg-black/20 backdrop-blur-md border border-purple-400/20 p-6 rounded-2xl">
          <label htmlFor="situation" className="text-xl font-cinzel text-purple-200 mb-4 block">
            1. What Did You Do?
          </label>
          <textarea
            id="situation"
            value={situation}
            onChange={(e) => { setSituation(e.target.value); setError(''); }}
            placeholder="e.g., I accidentally liked my ex's photo from 3 years ago..."
            className="w-full max-w-2xl mx-auto bg-purple-900/30 border-2 border-purple-400/50 rounded-lg p-4 text-white placeholder-purple-300/60 focus:ring-2 focus:ring-yellow-400 focus:outline-none transition-all duration-300 min-h-[100px] resize-none"
            rows={3}
            disabled={isLoading}
          />
          <div className="mt-4">
            <p className="text-sm text-purple-400 font-cinzel mb-3">Or pick a classic disaster:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {QUICK_SITUATIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => { setSituation(s); setError(''); setResult(''); }}
                  className="text-xs px-3 py-1.5 rounded-full border border-purple-400/40 bg-purple-900/30 text-purple-200 hover:border-yellow-400/60 hover:text-yellow-300 transition-all duration-200"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-black/20 backdrop-blur-md border border-purple-400/20 p-6 rounded-2xl">
          <label className="text-xl font-cinzel text-purple-200 mb-4 block">2. Choose Your Excuse Tone</label>
          <PersonalitySelector selectedPersonality={personality} onPersonalitySelect={handlePersonalitySelect} />
        </section>

        <div>
          <button
            type="submit"
            disabled={isLoading || !situation.trim()}
            className="px-8 py-4 bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-bold font-cinzel rounded-lg text-lg tracking-wider transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-400/40 disabled:bg-gray-500 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
          >
            {isLoading ? 'Blaming the Planets...' : 'Blame Mercury'}
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
        {result && !isLoading && (
          <HoroscopeCard text={result} title="Mercury Made Me Do It" icons={['☿', '🌀']} />
        )}
      </div>
    </main>
  );
};

export default MercuryExcuseView;
