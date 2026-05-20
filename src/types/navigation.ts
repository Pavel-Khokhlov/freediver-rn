import { NativeStackScreenProps } from '@react-navigation/native-stack';

// Определите все параметры для каждого экрана
export type RootStackParamList = {
  // Публичные экраны
  Login: undefined;
  Register: undefined;
  
  // Приватные экраны
  Home: {
    hasCustomHeader?: boolean;
  };
  Profile: {
    hasStackHeader?: boolean;
    userId?: string;
  };
  Settings: undefined;
  // ... другие экраны
};

// Типизированный хук для навигации
export type NavigationProps<T extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, T>;