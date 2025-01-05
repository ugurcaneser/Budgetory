import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import "./global.css"
import HomeScreen from './screens/HomeScreen';
import { CurrencyProvider } from './context/CurrencyContext';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <CurrencyProvider>
          <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home" component={HomeScreen} />
          </Stack.Navigator>
          <StatusBar style="auto" />
        </CurrencyProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}