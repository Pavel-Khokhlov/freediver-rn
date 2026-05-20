import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import TrainingScreen from '@/screens/private/TrainingScreen';
import { useTranslator } from '@/contexts/TranslatorContext';
import { createStackHeaderFunc } from './StackHeader';

const TrainStack = createStackNavigator();
const stackHeaderNoBack = createStackHeaderFunc({
  canGoBack: false,
  headerBackVisible: false,
});

const TrainingTabNavigator = () => {
  const {t} = useTranslator();
  return (
    <TrainStack.Navigator
      initialRouteName="TrainingMain"
      screenOptions={{
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        headerTransparent: true,
      }}
      >
      <TrainStack.Screen
        name="TrainingMain"
        component={TrainingScreen}
        options={{
          headerShown: true,
          header: stackHeaderNoBack,
          title: t('mainTitle.training'),
          headerTransparent: true,
        }}
      />
    </TrainStack.Navigator>
  );
};

export default TrainingTabNavigator;
