import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import ProfileScreen from '@/screens/private/ProfileScreen';
import { createStackHeaderFunc } from './StackHeader';
import { useTranslator } from '@/contexts/TranslatorContext';

const ProfileStack = createStackNavigator();

const stackHeaderNoBack = createStackHeaderFunc({
  canGoBack: false,
  headerBackVisible: false,
});

const ProfileTabNavigator = () => {
  const {t} = useTranslator();
  return (
    <ProfileStack.Navigator
      initialRouteName="ProfileMain"
      screenOptions={{
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        headerTransparent: true,
      }}
      >
      <ProfileStack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{
          headerShown: true,
          header: stackHeaderNoBack,
          title: t('mainTitle.profile'),
          headerTransparent: true,
        }}
      />
    </ProfileStack.Navigator>
  );
};

export default ProfileTabNavigator;
