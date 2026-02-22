import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 animate-fade-in">
        <div className="relative w-24 h-24">
            <div className="absolute inset-0 border-2 border-purple-400/50 rounded-full animate-spin [animation-duration:3s]"></div>
            <div className="absolute inset-2 border-2 border-yellow-400/50 rounded-full animate-[spin_2.5s_linear_infinite_reverse]"></div>
            <div className="absolute inset-5 border-2 border-fuchsia-400/50 rounded-full animate-spin [animation-duration:2s]"></div>
            <div className="absolute inset-0 flex items-center justify-center text-yellow-300 text-3xl font-cinzel animate-pulse">
            🔮
            </div>
        </div>
        <p className="text-purple-300 animate-pulse font-cinzel tracking-widest">Decoding the Cosmos...</p>
    </div>
  );
};

export default Loader;