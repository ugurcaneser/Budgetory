import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import "./global.css"
import HomeScreen from './screens/HomeScreen';
import { CurrencyProvider } from './context/CurrencyContext';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export type RootStackParamList = {
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <CurrencyProvider>
            <Stack.Navigator 
              initialRouteName="Home" 
              screenOptions={{ 
                headerShown: false,
                animation: 'slide_from_right'
              }}
            >
              <Stack.Screen name="Home" component={HomeScreen} />
            </Stack.Navigator>
            <StatusBar style="auto" />
          </CurrencyProvider>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}