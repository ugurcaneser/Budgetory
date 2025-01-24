import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import "./global.css"
import HomeScreen from './screens/HomeScreen';
import { CurrencyProvider } from './context/CurrencyContext';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createStackNavigator } from '@react-navigation/stack';
import { Transaction } from './utils/storage';
import AboutScreen from './screens/AboutScreen';
import { enableScreens } from 'react-native-screens';
import ChartScreen from './screens/ChartScreen';

enableScreens();

// Navigation type definitions
type RootStackParamList = {
  Home: undefined;
  Chart: undefined;
  About: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <CurrencyProvider>
          <NavigationContainer>
            <Stack.Navigator>
              <Stack.Screen 
                name="Home" 
                component={HomeScreen} 
                options={{ headerShown: false }} 
              />
              <Stack.Screen 
                name="Chart" 
                component={ChartScreen} 
                options={{ headerShown: false }} 
              />
              <Stack.Screen 
                name="About" 
                component={AboutScreen} 
                options={{ title: 'About' }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </CurrencyProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}