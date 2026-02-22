import React, { useState } from 'react';

interface AdminLoginModalProps {
  onClose: () => void;
  onSubmit: (password: string) => string | undefined;
}

const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ onClose, onSubmit }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitError = onSubmit(password);
    if (submitError) {
      setError(submitError);
    }
  };

  return (
    <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-login-title"
    >
      <div 
        className="rounded-2xl p-0.5 bg-gradient-to-br from-yellow-400 to-amber-600 shadow-2xl shadow-purple-500/30 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
      >
        <div className="bg-slate-900 rounded-[15px] p-8">
          <h2 id="admin-login-title" className="text-2xl font-cinzel text-yellow-300 mb-6 tracking-wider text-center">Admin Access</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="admin-password" className="sr-only">Password</label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="Enter cosmic password"
                className="w-full bg-purple-900/30 border-2 border-purple-400/50 rounded-lg p-3 text-white placeholder-purple-300/60 focus:ring-2 focus:ring-yellow-400 focus:outline-none transition-all duration-300"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-red-400 text-sm text-center" role="alert">{error}</p>
            )}
            <div className="flex justify-center pt-2">
              <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 font-bold font-cinzel rounded-lg text-md tracking-wider transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-400/40"
              >
                  Authenticate
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginModal;