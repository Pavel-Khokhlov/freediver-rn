import React, { useCallback, useEffect, useState } from 'react';
import {
  createNavigationContainerRef,
  NavigationContainer,
} from '@react-navigation/native';
import { Host } from 'react-native-portalize';
import RootNavigator from './RootNavigator';
import { useStore } from '../store';
import LoadingScreen from './LoadingScreen';

export const navigationRef = createNavigationContainerRef();

const AppContainer = () => {
  const { authStore } = useStore();
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  const onNavigationReady = useCallback(() => {
    setIsNavigationReady(true);
    authStore.setIsNavigationReady(true); // Если нужно сохранить в хранилище
  }, [authStore]);

  // Добавляем таймаут на случай, если навигация не загрузится
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isNavigationReady) {
        console.warn('Navigation loading timeout - forcing ready state');
        onNavigationReady();
      }
    }, 2000); // delay 2 seconds

    return () => clearTimeout(timer);
  }, [isNavigationReady, onNavigationReady]);

  if (!isNavigationReady) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer ref={navigationRef} onReady={onNavigationReady}>
      <Host>
        <RootNavigator />
      </Host>
    </NavigationContainer>
  );
};

export default AppContainer;
