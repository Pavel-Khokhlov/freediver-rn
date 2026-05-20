import React, {useCallback} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import HomeScreen from '@/screens/private/HomeScreen';
import AppHeader from './AppHeader';

const HomeStack = createStackNavigator();

const HomeTabNavigator = () => {
  const AppHeaderComponent = useCallback(() => <AppHeader />, []);
  return (
    <HomeStack.Navigator
      initialRouteName="HomeMain"
      screenOptions={{
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        headerTransparent: true,
      }}
      >
      <HomeStack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{
          headerShown: true,
          header: AppHeaderComponent,
        }}
      />
    </HomeStack.Navigator>
  );
};

export default HomeTabNavigator;
