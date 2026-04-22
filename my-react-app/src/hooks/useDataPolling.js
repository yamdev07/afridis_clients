import { useEffect } from 'react';

// Events de synchronisation globale
export const SYNC_EVENT = 'clientflow:sync';
export const CLIENTS_SYNC_KEY = 'clientflow:clients-sync';
export const SERVICES_SYNC_KEY = 'clientflow:services-sync';

/**
 * Hook pour synchroniser les données entre onglets/fenêtres et utilisateurs
 * Utilise localStorage pour la détection entre onglets et polling pour les changements server
 * @param {string} dataType - Type de données ('clients', 'services', 'reports', etc.)
 * @param {function} fetchFn - Fonction pour récupérer les données
 * @param {number} pollInterval - Intervalle de polling en ms (défaut: 15s)
 * @returns {object} - { isPolling, lastSync }
 */
export const useDataPolling = (dataType, fetchFn, pollInterval = 15000) => {
  useEffect(() => {
    let intervalId;
    let lastSyncTime = Date.now();

    // Fonction de synchronisation
    const sync = async () => {
      try {
        await fetchFn();
      } catch (error) {
        console.error(`Erreur lors du polling ${dataType}:`, error);
      }
    };

    // Handler pour les changements detailles via localStorage
    const handleStorageChange = (event) => {
      const storageKey = getStorageKey(dataType);
      if (event.key === storageKey) {
        // Données mises à jour par un autre onglet/utilisateur
        sync();
      }
    };

    // Handler pour les changements via CustomEvent
    const handleSyncEvent = (event) => {
      if (event.detail?.dataType === dataType) {
        sync();
      }
    };

    // Handler pour la visibilité (rafraîchir quand l'onglet devient visible)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const timeSinceLastSync = Date.now() - lastSyncTime;
        // Rafraîchir si plus de 5 secondes écoulées
        if (timeSinceLastSync > 5000) {
          sync();
          lastSyncTime = Date.now();
        }
      }
    };

    // Faire un sync initial
    sync();
    lastSyncTime = Date.now();

    // Configurer le polling périodique
    intervalId = setInterval(() => {
      sync();
      lastSyncTime = Date.now();
    }, pollInterval);

    // Ajouter les listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(SYNC_EVENT, handleSyncEvent);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalId) clearInterval(intervalId);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(SYNC_EVENT, handleSyncEvent);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [dataType, fetchFn, pollInterval]);

  return { isPolling: true };
};

/**
 * Obtenir la clé localStorage pour un type de données
 */
export const getStorageKey = (dataType) => {
  switch (dataType) {
    case 'clients':
      return CLIENTS_SYNC_KEY;
    case 'services':
      return SERVICES_SYNC_KEY;
    default:
      return `clientflow:${dataType}-sync`;
  }
};

/**
 * Notifier tous les clients de la mise à jour
 * @param {string} dataType - Type de données
 * @param {object} details - Détails additionnels
 */
export const notifyDataSync = (dataType, details = {}) => {
  // Stocker dans localStorage (pour les autres onglets)
  const storageKey = getStorageKey(dataType);
  localStorage.setItem(storageKey, JSON.stringify({
    timestamp: Date.now(),
    dataType,
    ...details,
  }));

  // Dispatcher un événement (pour d'autres pages du même onglet)
  window.dispatchEvent(new CustomEvent(SYNC_EVENT, {
    detail: {
      dataType,
      timestamp: Date.now(),
      ...details,
    },
  }));
};
