import HomeTabNavigator from './HomeTabNavigator';
import TrainingTabNavigator from './TrainingTabNavigator';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import TabBar from './TabBar';
import ProfileTabNavigator from './ProfileTabNavigator';
import MoreTabNavigator from './MoreTabNavigator';

export type PrivateStackParamList = {
  Home: undefined;
  Training: undefined;
  Profile: undefined;
  More: undefined;
};

const tabScreenOptions = {
    headerShown: false,
    contentStyle: {
      backgroundColor: 'red',
    },
  };

const Tab = createBottomTabNavigator<PrivateStackParamList>();

const PrivateNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props: any) => <TabBar {...props} />}
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
      }}>
      <Tab.Screen name="Home" component={HomeTabNavigator} options={tabScreenOptions}/>
      <Tab.Screen name="Training" component={TrainingTabNavigator} options={tabScreenOptions} />
      <Tab.Screen name="Profile" component={ProfileTabNavigator} options={tabScreenOptions} />
      <Tab.Screen name="More" component={MoreTabNavigator} options={tabScreenOptions} />
    </Tab.Navigator>
  );
};

export default PrivateNavigator;
