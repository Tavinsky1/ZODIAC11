import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Personality } from '../types';
import { getDreamInterpretation } from '../services/geminiService';
import Loader from './Loader';
import HoroscopeCard from './HoroscopeCard';
import PersonalitySelector from './PersonalitySelector';
import { playSubmitSound, playRevealSound } from '../utils/sound';

interface DreamDecoderViewProps {
  logGeneration: () => void;
  personality: Personality;
  onPersonalitySelect: (p: Personality) => void;
}

const DreamDecoderView: React.FC<DreamDecoderViewProps> = ({ logGeneration, personality, onPersonalitySelect }) => {
  const [dream, setDream] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handlePersonalitySelect = useCallback((p: Personality) => {
    onPersonalitySelect(p);
    setResult('');
  }, [onPersonalitySelect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dream.trim()) {
      setError('Please describe your dream to have it decoded.');
      return;
    }

    playSubmitSound();
    setIsLoading(true);
    setError('');
    setResult('');

    try {
      const stream = getDreamInterpretation(dream, personality);
      
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
        logGeneration();
      }

    } catch (err: any) {
      setError("Oops! The cosmos are a bit fuzzy right now. We couldn't decode your dream. Please try again later.");
      setIsLoading(false);
    }
  };

  return (
    <main className="w-full max-w-4xl mx-auto space-y-8 sm:space-y-10 animate-fade-in">
      <header className="space-y-2">
        <h1 className="text-5xl sm:text-7xl font-bold font-cinzel text-yellow-300 tracking-widest text-glow">
          Dream Decoder
        </h1>
        <p className="text-md sm:text-lg text-purple-300 max-w-xl mx-auto">
          Unravel the bizarre, profound, or just plain weird mysteries of your slumber.
        </p>
      </header>
      
      <form onSubmit={handleSubmit} className="w-full space-y-8">
        <section className="bg-black/20 backdrop-blur-md border border-purple-400/20 p-6 rounded-2xl">
          <label htmlFor="dream-description" className="text-xl font-cinzel text-purple-200 mb-4 block">1. Describe Your Dream</label>
           <textarea
              id="dream-description"
              value={dream}
              onChange={(e) => { setDream(e.target.value); setError(''); }}
              placeholder="e.g., I was flying on a giant pickle over a city made of cheese..."
              className="w-full max-w-2xl mx-auto bg-purple-900/30 border-2 border-purple-400/50 rounded-lg p-4 text-white placeholder-purple-300/60 focus:ring-2 focus:ring-yellow-400 focus:outline-none transition-all duration-300 min-h-[150px] resize-none"
              rows={5}
              disabled={isLoading}
          />
        </section>

        <section className="bg-black/20 backdrop-blur-md border border-purple-400/20 p-6 rounded-2xl">
          <label className="text-xl font-cinzel text-purple-200 mb-4 block">2. Choose Your Guide</label>
          <PersonalitySelector selectedPersonality={personality} onPersonalitySelect={handlePersonalitySelect} />
        </section>

        <div>
          <button
            type="submit"
            disabled={isLoading || !dream.trim()}
            className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 font-bold font-cinzel rounded-lg text-lg tracking-wider transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-400/40 disabled:bg-gray-500 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
          >
            {isLoading ? 'Decoding Visions...' : 'Decode My Dream'}
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
          <HoroscopeCard text={result} title={`Your Dream, Decoded`} icons={['🌙']} />
        )}
      </div>
    </main>
  );
};

export default DreamDecoderView;