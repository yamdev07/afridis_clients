import React, { useEffect, useState } from 'react';

export const SessionTimeoutModal = ({ 
  isOpen, 
  timeRemaining, 
  onStayConnected, 
  onLogout 
}) => {
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (timeRemaining > 0) {
      const mins = Math.floor(timeRemaining / 60000);
      const secs = Math.floor((timeRemaining % 60000) / 1000);
      setMinutes(mins);
      setSeconds(secs);
    }
  }, [timeRemaining]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-6 max-w-md w-full mx-4 animate-in">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Session sur le point d'expirer
          </h2>
        </div>

        {/* Message */}
        <p className="text-slate-600 dark:text-slate-300 mb-6">
          Votre session expirera dans <span className="font-semibold">{minutes}:{seconds.toString().padStart(2, '0')}</span> minutes.
        </p>

        {/* Timer visuel */}
        <div className="mb-6 flex justify-center">
          <div className="text-center">
            <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 font-mono">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Temps restant
            </p>
          </div>
        </div>

        {/* Info */}
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Souhaitez-vous rester connecté en tant qu'utilisateur ?
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onLogout}
            className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium"
          >
            Non, me déconnecter
          </button>
          <button
            onClick={onStayConnected}
            className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium shadow-lg hover:shadow-indigo-600/50"
          >
            Oui, rester connecté
          </button>
        </div>

        {/* Footer info */}
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-4">
          Si vous ne répondez pas, vous serez automatiquement déconnecté.
        </p>
      </div>
    </div>
  );
};
