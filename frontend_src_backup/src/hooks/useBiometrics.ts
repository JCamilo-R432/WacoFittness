import { useState, useCallback, useEffect } from 'react';

/**
 * Hook to handle biometric authentication (Face ID / Touch ID)
 * Wraps react-native-biometrics with error handling and availability checks.
 */
export const useBiometrics = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometryType, setBiometryType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    try {
      // Dynamic import to avoid crash when library isn't linked
      const ReactNativeBiometrics = require('react-native-biometrics').default;
      const rnBiometrics = new ReactNativeBiometrics();
      const { available, biometryType: type } = await rnBiometrics.isSensorAvailable();
      setIsAvailable(available);
      setBiometryType(type ?? null);
    } catch {
      setIsAvailable(false);
    }
  };

  const authenticate = useCallback(async (promptMessage = 'Confirma tu identidad') => {
    if (!isAvailable) return false;
    setLoading(true);
    try {
      const ReactNativeBiometrics = require('react-native-biometrics').default;
      const rnBiometrics = new ReactNativeBiometrics();
      const { success } = await rnBiometrics.simplePrompt({ promptMessage });
      return success;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAvailable]);

  return { isAvailable, biometryType, loading, authenticate };
};
