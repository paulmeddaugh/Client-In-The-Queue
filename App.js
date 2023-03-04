import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Login from './Screens/Login';
import Help from './Screens/Help';
import WaitingList from './Screens/WaitingList';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

export default function App() {

  const Tab = createBottomTabNavigator();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarStyle: { display: 'none'}
        })}>
        <Tab.Screen name="Login" component={Login} options={{headerShown: false}} />
        <Tab.Screen name="Help" component={Help} options={{headerShown: false}} />
        <Tab.Screen name="Waiting List" component={WaitingList} options={{headerShown: false}} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}