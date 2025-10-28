/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/SpashScreen';
import i18n, {t} from "./src/modules/i18n"
import { useEffect } from 'react';
import { appInit, store } from './src/store+client/store';
import { useSnapshot } from 'valtio';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(()=>{
    appInit();
  }, []);

  const snap = useSnapshot(store);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {snap.isLoading ? <SplashScreen/> : <AppContent />}
    </SafeAreaProvider>
  );
}

function AppContent() {
  return <AppNavigator />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
