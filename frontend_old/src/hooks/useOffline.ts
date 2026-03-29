import { useEffect, useState } from 'react';

export const useOffline = () => {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let unsubscribe: null | (() => void) = null;
    try {
      const NetInfo = require('@react-native-community/netinfo').default;
      unsubscribe = NetInfo.addEventListener((state: any) => {
        setIsOnline(Boolean(state.isConnected));
      });
      NetInfo.fetch?.().then((state: any) => setIsOnline(Boolean(state.isConnected)));
    } catch {
      setIsOnline(null);
    }
    return () => {
      try {
        unsubscribe?.();
      } catch {
        // ignore
      }
    };
  }, []);

  return { isOnline };
};

