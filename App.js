import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Login from './scripts/Screens/Login';
import Help from './scripts/Screens/Help';
import WaitingList from './scripts/Screens/WaitingList';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

export default function App() {

  const Stack = createNativeStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={Login} options={{headerShown: false}} />
        <Stack.Screen name="Help" component={Help} options={{headerShown: false}} />
        <Stack.Screen name="Waiting List" component={WaitingList} options={{headerShown: false}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}