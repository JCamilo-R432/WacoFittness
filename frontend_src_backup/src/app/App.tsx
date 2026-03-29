import React from 'react';
import { useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { PaperProvider } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { store, persistor } from './store';
import { AppNavigator } from '../navigation/AppNavigator';
import type { RootState } from './store';
import { darkTheme, lightTheme } from './theme';
import { linking } from './linking';
import { usePushNotifications } from '../hooks/useNotifications';

const AppInner = () => {
  const scheme = useColorScheme();
  const themeSetting = useSelector((s: RootState) => s.user.settings.theme);
  usePushNotifications();
  const theme =
    themeSetting === 'system'
      ? scheme === 'dark'
        ? darkTheme
        : lightTheme
      : themeSetting === 'dark'
        ? darkTheme
        : lightTheme;

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer linking={linking}>
        <AppNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
};

export const App = () => {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <AppInner />
      </PersistGate>
    </Provider>
  );
};

export default App;

