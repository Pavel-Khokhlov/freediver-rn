import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigatorScreenParams } from '@react-navigation/native';
import PublicNavigator, { PublicStackParamList } from './PublicNavigator';
import PrivateNavigator, { PrivateStackParamList } from './PrivateNavigator';
import { useStore } from '../store';

type RootStackParamList = {
  Public: NavigatorScreenParams<PublicStackParamList>;
  Private: NavigatorScreenParams<PrivateStackParamList>;
  // Add any modal screens here that should appear above both stacks
};

const RootStack = createStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const { authStore } = useStore();
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {authStore.isLogged ? (
        <RootStack.Screen
          key="private"
          name="Private"
          component={PrivateNavigator}
        />
      ) : (
          <RootStack.Screen
          key="public"
          name="Public"
          component={PublicNavigator}
        />
      )}
    </RootStack.Navigator>
  );
};

export default RootNavigator;
