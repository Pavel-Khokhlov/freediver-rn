import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import MoreScreen from '@/screens/private/MoreScreen';
import { createStackHeaderFunc } from './StackHeader';
import { useTranslator } from '@/contexts/TranslatorContext';

const MoreStack = createStackNavigator();
const stackHeaderNoBack = createStackHeaderFunc({
  canGoBack: false,
  headerBackVisible: false,
});

const MoreTabNavigator = () => {
  const {t} = useTranslator();
  return (
    <MoreStack.Navigator
      initialRouteName="MoreMain"
      screenOptions={{
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        headerTransparent: true,
      }}
      >
      <MoreStack.Screen
        name="MoreMain"
        component={MoreScreen}
        options={{
          headerShown: true,
          header: stackHeaderNoBack,
          title: t('mainTitle.settings'),
          headerTransparent: true,
        }}
      />
    </MoreStack.Navigator>
  );
};

export default MoreTabNavigator;
