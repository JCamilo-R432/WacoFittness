import { useEffect, useCallback } from 'react';
import { Platform, Alert } from 'react-native';

/**
 * Hook to manage Firebase Cloud Messaging push notifications
 */
export const usePushNotifications = () => {
  useEffect(() => {
    requestPermission();
    setupListeners();
  }, []);

  const requestPermission = async () => {
    try {
      if (Platform.OS === 'ios') {
        const messaging = require('@react-native-firebase/messaging').default;
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === 1 /* AUTHORIZED */ ||
          authStatus === 2 /* PROVISIONAL */;
        if (!enabled) {
          console.log('Push notification permission denied');
        }
      }
    } catch {
      // Firebase might not be configured
    }
  };

  const getToken = useCallback(async (): Promise<string | null> => {
    try {
      const messaging = require('@react-native-firebase/messaging').default;
      return await messaging().getToken();
    } catch {
      return null;
    }
  }, []);

  const setupListeners = () => {
    try {
      const messaging = require('@react-native-firebase/messaging').default;

      // Foreground message
      messaging().onMessage(async (remoteMessage: any) => {
        Alert.alert(
          remoteMessage.notification?.title ?? 'Notificación',
          remoteMessage.notification?.body ?? '',
        );
      });

      // Background / quit
      messaging().setBackgroundMessageHandler(async (remoteMessage: any) => {
        console.log('Background message:', remoteMessage);
      });
    } catch {
      // Firebase not configured
    }
  };

  return { getToken, requestPermission };
};
