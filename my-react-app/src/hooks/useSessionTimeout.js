import { useEffect, useRef, useState, useCallback } from 'react';
import { api } from '../api/clientflow';

// Constantes de timing (en millisecondes)
const SESSION_TIMEOUT = 35 * 60 * 1000; // 35 minutes
const WARNING_TIME = 5 * 60 * 1000; // 5 minutes avant expiration
const CHECK_INTERVAL = 1000; // Vérifier chaque seconde

export const useSessionTimeout = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(WARNING_TIME);
  const lastActivityRef = useRef(Date.now());
  const warningTimeoutRef = useRef(null);
  const logoutTimeoutRef = useRef(null);
  const checkIntervalRef = useRef(null);
  const hasTokenRef = useRef(!!localStorage.getItem('token'));

  // Enregistrer l'activité utilisateur
  const recordActivity = useCallback(() => {
    if (!hasTokenRef.current) return;

    lastActivityRef.current = Date.now();

    // Si la modale est affichée, la fermer et rafraîchir la session
    if (showWarning) {
      setShowWarning(false);
      // Essayer de rafraîchir la session
      api.checkSessionActivity().catch(() => {
        // Silencieusement échouer - le token va expirer
      });
    }

    // Réinitialiser les timers
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (logoutTimeoutRef.current) clearTimeout(logoutTimeoutRef.current);

    // Configurer le nouveau timer d'avertissement
    warningTimeoutRef.current = setTimeout(() => {
      if (Date.now() - lastActivityRef.current >= SESSION_TIMEOUT - WARNING_TIME) {
        setShowWarning(true);
        setTimeRemaining(WARNING_TIME);

        // Configurer le timer de déconnexion (5 minutes)
        logoutTimeoutRef.current = setTimeout(() => {
          handleLogout();
        }, WARNING_TIME);
      }
    }, SESSION_TIMEOUT - WARNING_TIME);
  }, [showWarning]);

  // Déconnecter l'utilisateur
  const handleLogout = useCallback(async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setShowWarning(false);
      // La redirection vers / est gérée par l'intercepteur de réponse
    }
  }, []);

  // Décliner la session (déconnecter immédiatement)
  const handleDeclineSession = useCallback(() => {
    handleLogout();
  }, [handleLogout]);

  // Accepter la session (rafraîchir et continuer)
  const handleAcceptSession = useCallback(async () => {
    try {
      await api.checkSessionActivity();
      setShowWarning(false);
      recordActivity();
    } catch (error) {
      console.error('Erreur lors du rafraîchissement de la session:', error);
      handleLogout();
    }
  }, [recordActivity, handleLogout]);

  // Initialiser les listeners d'activité
  useEffect(() => {
    const token = localStorage.getItem('token');
    hasTokenRef.current = !!token;

    if (!token) {
      // Pas d'utilisateur connecté
      return;
    }

    // Enregistrer l'activité initiale
    recordActivity();

    // Écouter les événements d'activité utilisateur
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      recordActivity();
    };

    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    // Timer de vérification du timeout
    checkIntervalRef.current = setInterval(() => {
      const timeSinceActivity = Date.now() - lastActivityRef.current;

      // Si on a dépassé le timeout de session
      if (timeSinceActivity >= SESSION_TIMEOUT) {
        setShowWarning(true);
        setTimeRemaining(WARNING_TIME);
      }
      // Si on est dans la fenêtre d'avertissement
      else if (timeSinceActivity >= SESSION_TIMEOUT - WARNING_TIME && showWarning) {
        const remaining = WARNING_TIME - (timeSinceActivity - (SESSION_TIMEOUT - WARNING_TIME));
        setTimeRemaining(Math.max(0, remaining));

        // Si le temps d'avertissement est écoulé
        if (remaining <= 0) {
          handleLogout();
        }
      }
    }, CHECK_INTERVAL);

    return () => {
      // Cleanup
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });

      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (logoutTimeoutRef.current) clearTimeout(logoutTimeoutRef.current);
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, [recordActivity, handleLogout, showWarning]);

  // Mettre à jour le token ref quand le localStorage change
  useEffect(() => {
    const handleStorageChange = () => {
      hasTokenRef.current = !!localStorage.getItem('token');
      if (!hasTokenRef.current) {
        setShowWarning(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    showWarning,
    timeRemaining,
    handleAcceptSession,
    handleDeclineSession,
  };
};
