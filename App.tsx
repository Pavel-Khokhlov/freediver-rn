/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import 'react-native-gesture-handler';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

// import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import BootSplash from 'react-native-bootsplash';
import { useEffect } from 'react';
import { TranslatorProvider } from '@/contexts/TranslatorContext';
import AppContainer from './src/navigation/AppContainer';
import { useStore } from '@/store';

function App() {
  const { authStore } = useStore();
  const isDarkMode = useColorScheme() === 'dark' ? true : true;

  useEffect(() => {
    authStore.initializeApp()
    const prepare = async () => {
      await BootSplash.hide({ fade: true });
    };

    prepare();
  }, []);

  return (
    <SafeAreaProvider>
      <TranslatorProvider>
        <GestureHandlerRootView style={styles.gestureRoot}>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <AppContainer />
        </GestureHandlerRootView>
      </TranslatorProvider>
    </SafeAreaProvider>
  );
}

export default App;

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
});
