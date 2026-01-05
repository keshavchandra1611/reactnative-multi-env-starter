import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import QrLogin from './src/Screens/QrLogin/QrLogin';
import Home from './src/Screens/Home/Home';

export default function App() {
  const Stack = createNativeStackNavigator();
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator
        initialRouteName="QrLogin"
        screenOptions={{ headerShown: false, animation: "fade" }}
      >
        <Stack.Screen name="QrLogin" component={QrLogin} />
        <Stack.Screen name="Home" component={Home} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
