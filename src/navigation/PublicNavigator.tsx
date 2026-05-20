import {createStackNavigator} from '@react-navigation/stack';
import StartScreen from '../screens/public/LoginScreen';
import RegistrationScreen from '../screens/public/RegistrationScreen';

export type PublicStackParamList = {
  Login: undefined;
  Registration: {enteredPin: string};
};

const PublicStack = createStackNavigator<PublicStackParamList>();

const PublicNavigator = () => (
  <PublicStack.Navigator
    initialRouteName="Login"
    screenOptions={{
      headerShown: false,
      gestureEnabled: true,
      cardOverlayEnabled: true,
    }}>
    <PublicStack.Screen name="Login" component={StartScreen} />
    {/* <PublicStack.Screen name="Profile" component={ProfileScreen} options={{ gestureEnabled: false }} /> */}
    <PublicStack.Screen name="Registration" component={RegistrationScreen} options={{ gestureEnabled: false }} />
  </PublicStack.Navigator>
);

export default PublicNavigator;
