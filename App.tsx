import React, { useState, useCallback, useEffect } from 'react';
import { ZodiacSign, Zodiac, AnalyticsData, Personality, View } from './types';
import { ZODIAC_SIGNS } from './constants';
import { getHoroscope, getStoredToken, saveToken } from './services/geminiService';
import ZodiacSelector from './components/ZodiacSelector';
import Loader from './components/Loader';
import HoroscopeCard from './components/HoroscopeCard';
import AdminLoginModal from './components/AdminLoginModal';
import AdminDashboard from './components/AdminDashboard';
import PersonalitySelector from './components/PersonalitySelector';
import Navbar from './components/Navbar';
import PetHoroscopeView from './components/PetHoroscopeView';
import DreamDecoderView from './components/DreamDecoderView';
import { playSubmitSound, playRevealSound } from './utils/sound';
import CompatibilityView from './components/CompatibilityView';
import PlantHoroscopeView from './components/PlantHoroscopeView';

// Helper function to get analytics from localStorage
const getAnalyticsData = (): AnalyticsData => {
  const data = localStorage.getItem('zodiacLolAnalytics');
  if (data) {
    return JSON.parse(data);
  }
  // Initialize if it doesn't exist
  const initialData: AnalyticsData = {
    totalGenerations: 0,
    generationsBySign: {},
  };
  return initialData;
};

// Helper function to save analytics to localStorage
const saveAnalyticsData = (data: AnalyticsData) => {
  localStorage.setItem('zodiacLolAnalytics', JSON.stringify(data));
};

const App: React.FC = () => {
  const [githubToken, setGithubToken] = useState<string>(getStoredToken);
  const [tokenInput, setTokenInput] = useState<string>('');
  const [showTokenOverlay, setShowTokenOverlay] = useState<boolean>(!getStoredToken().trim());

  const handleSaveToken = () => {
    if (!tokenInput.trim()) return;
    saveToken(tokenInput.trim());
    setGithubToken(tokenInput.trim());
    setShowTokenOverlay(false);
  };

  const [view, setView] = useState<View>('horoscope');
  const [selectedSign, setSelectedSign] = useState<ZodiacSign | null>(null);
  const [question, setQuestion] = useState<string>('');
  const [personality, setPersonality] = useState<Personality>('default');
  const [horoscope, setHoroscope] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Admin state
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showAdminLogin, setShowAdminLogin] = useState<boolean>(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>(getAnalyticsData());

  // Check for admin hash on mount
  useEffect(() => {
    if (window.location.hash === '#admin') {
      setShowAdminLogin(true);
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);

  const handleSignSelect = useCallback((sign: ZodiacSign) => {
    setSelectedSign(sign);
    setError('');
    setHoroscope('');
  }, []);
  
  const handlePersonalitySelect = useCallback((p: Personality) => {
    setPersonality(p);
    setHoroscope('');
  }, []);

  const logGeneration = useCallback(() => {
    const currentData = getAnalyticsData();
    const updatedData: AnalyticsData = {
      ...currentData,
      totalGenerations: currentData.totalGenerations + 1,
    };
    saveAnalyticsData(updatedData);
    setAnalyticsData(updatedData); // Update state for live dashboard view
  }, []);

  const logAnalytics = useCallback((sign: ZodiacSign) => {
    logGeneration();
    const currentData = getAnalyticsData(); // Reread to get latest total
    const updatedData: AnalyticsData = {
      ...currentData,
      generationsBySign: {
        ...currentData.generationsBySign,
        [sign]: (currentData.generationsBySign[sign] || 0) + 1,
      },
    };
    saveAnalyticsData(updatedData);
    setAnalyticsData(updatedData);
  }, [logGeneration]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSign || !question.trim()) {
      setError('Please select your sign and ask a question to the cosmos.');
      return;
    }
    
    playSubmitSound();
    setIsLoading(true);
    setError('');
    setHoroscope('');

    try {
      const stream = getHoroscope(selectedSign, question, personality);
      
      let firstChunk = true;
      let fullResponse = "";

      for await (const chunk of stream) {
        if (firstChunk) {
          setIsLoading(false); // Stop loading once the first text chunk arrives
          playRevealSound();
          firstChunk = false;
        }
        fullResponse += chunk;
        setHoroscope(fullResponse);
      }
      
      // Only log analytics if the generation was successful
      if (!fullResponse.includes('### Cosmic Connection Error')) {
        logAnalytics(selectedSign);
      }

    } catch (err: any) {
      console.error("A cosmic disturbance occurred while setting up the horoscope stream:", err);
      setError("Oops! The cosmos are a bit fuzzy right now. We couldn't retrieve your horoscope. Please try again later.");
      setIsLoading(false);
    }
  };

  const handleAdminLogin = (password: string) => {
    // Use environment variable for admin password for better security.
    // Fallback to a default for easy setup in development.
    const correctPassword = process.env.ADMIN_PASSWORD || 'COSMOS_ADMIN';
    if (password === correctPassword) {
      setIsAdmin(true);
      setShowAdminLogin(false);
    } else {
      return "Incorrect password. The stars are not aligned for you.";
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
  };
  
  const selectedSignData = ZODIAC_SIGNS.find(sign => sign.name === selectedSign);

  const headerContent = {
    default: {
      title: 'ZodiacLOL',
      subtitle: 'Your daily dose of brutally honest cosmic guidance, wrapped in sarcasm.'
    },
    cat: {
      title: 'Catstrology 😼',
      subtitle: 'Cosmic declarations from a feline who is, obviously, superior to you.'
    },
    dog: {
      title: 'Pawsitive Vibes 🐶',
      subtitle: 'Wholesome horoscopes to help you unleash your inner good boy.'
    }
  };

  if (isAdmin) {
    return <AdminDashboard analyticsData={analyticsData} onLogout={handleAdminLogout} />;
  }

  if (showTokenOverlay) {
    return (
      <div className="fixed inset-0 bg-[#0D0B1F] flex items-center justify-center p-6 z-50">
        <div className="bg-purple-950/80 backdrop-blur-md border border-purple-400/30 rounded-2xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl shadow-purple-900/50">
          <div className="text-6xl">🔑</div>
          <h1 className="text-3xl font-bold font-cinzel text-yellow-300 tracking-wider">Activate the Oracle</h1>
          <p className="text-purple-300 text-sm leading-relaxed">
            Enter your <strong className="text-yellow-300">GitHub Personal Access Token</strong> to power the Cosmic Oracle.<br />
            <span className="text-purple-400 text-xs mt-1 block">Create one at <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className="underline text-purple-300 hover:text-yellow-300">github.com/settings/tokens</a> with <strong>Models: Read</strong> permission.</span>
          </p>
          <input
            type="password"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveToken()}
            placeholder="github_pat_..."
            className="w-full bg-purple-900/40 border-2 border-purple-400/50 rounded-lg p-3 text-white placeholder-purple-400/60 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
          />
          <button
            onClick={handleSaveToken}
            disabled={!tokenInput.trim()}
            className="w-full px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 font-bold font-cinzel rounded-lg text-lg tracking-wider transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-yellow-400/40 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
          >
            Activate Oracle
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar currentView={view} onViewChange={setView} />
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 text-center overflow-hidden relative pt-28 sm:pt-32">
        {view === 'horoscope' && (
          <main className="w-full max-w-4xl mx-auto space-y-8 sm:space-y-10 animate-fade-in">
            <header className="space-y-2">
              <h1 className="text-5xl sm:text-7xl font-bold font-cinzel text-yellow-300 tracking-widest text-glow flex items-center justify-center gap-4">
                {headerContent[personality].title}
              </h1>
              <p className="text-md sm:text-lg text-purple-300 max-w-xl mx-auto">
                {headerContent[personality].subtitle}
              </p>
            </header>

            <form onSubmit={handleSubmit} className="w-full space-y-8">
                <section className="bg-black/20 backdrop-blur-md border border-purple-400/20 p-6 rounded-2xl">
                  <label className="text-xl font-cinzel text-purple-200 mb-4 block">1. Choose Your Sign</label>
                  <ZodiacSelector selectedSign={selectedSign} onSignSelect={handleSignSelect} />
                </section>

                <section className="bg-black/20 backdrop-blur-md border border-purple-400/20 p-6 rounded-2xl">
                  <label htmlFor="question" className="text-xl font-cinzel text-purple-200 mb-4 block">2. Ask a Burning Question</label>
                   <textarea
                      id="question"
                      value={question}
                      onChange={(e) => { setQuestion(e.target.value); setError(''); }}
                      placeholder="e.g., Will I ever find my matching sock?"
                      className="w-full max-w-2xl mx-auto bg-purple-900/30 border-2 border-purple-400/50 rounded-lg p-4 text-white placeholder-purple-300/60 focus:ring-2 focus:ring-yellow-400 focus:outline-none transition-all duration-300 min-h-[100px] resize-none"
                      rows={3}
                      disabled={isLoading}
                  />
                </section>

                <section className="bg-black/20 backdrop-blur-md border border-purple-400/20 p-6 rounded-2xl">
                  <label className="text-xl font-cinzel text-purple-200 mb-4 block">3. Choose Your Guide</label>
                  <PersonalitySelector selectedPersonality={personality} onPersonalitySelect={handlePersonalitySelect} />
                </section>
              
                <div>
                  <button
                      type="submit"
                      disabled={isLoading || !selectedSign || !question.trim()}
                      className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 font-bold font-cinzel rounded-lg text-lg tracking-wider transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-400/40 disabled:bg-gray-500 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
                  >
                      {isLoading ? 'Consulting the Cosmos...' : 'Reveal My Fate'}
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
                {horoscope && !isLoading && selectedSignData && (
                  <HoroscopeCard text={horoscope} title={`${selectedSignData.name}'s Cosmic "Wisdom"`} icons={[selectedSignData.icon]} />
                )}
            </div>
          </main>
        )}
        {view === 'petHoroscope' && (
          <PetHoroscopeView 
            logAnalytics={logAnalytics} 
            personality={personality} 
            onPersonalitySelect={handlePersonalitySelect} 
          />
        )}
        {view === 'dream' && (
          <DreamDecoderView
            logGeneration={logGeneration}
            personality={personality}
            onPersonalitySelect={handlePersonalitySelect}
          />
        )}
        {view === 'compatibility' && <CompatibilityView logAnalytics={logAnalytics} personality={personality} onPersonalitySelect={handlePersonalitySelect} />}
        {view === 'plant' && (
          <PlantHoroscopeView
            logAnalytics={logAnalytics}
            personality={personality}
            onPersonalitySelect={handlePersonalitySelect}
          />
        )}
      </div>
      {showAdminLogin && <AdminLoginModal onSubmit={handleAdminLogin} onClose={() => setShowAdminLogin(false)} />}
      {/* Token update button — always visible in bottom-right */}
      <button
        onClick={() => { setTokenInput(''); setShowTokenOverlay(true); }}
        title="Update GitHub Token"
        className="fixed bottom-4 right-4 w-10 h-10 bg-purple-800/70 hover:bg-purple-700 border border-purple-400/40 rounded-full text-lg flex items-center justify-center transition-all duration-200 hover:scale-110 z-40"
      >🔑</button>
    </>
  );
};

export default App;