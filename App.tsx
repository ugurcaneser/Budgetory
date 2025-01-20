import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import "./global.css"
import HomeScreen from './screens/HomeScreen';
import { CurrencyProvider } from './context/CurrencyContext';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import TransactionsScreen from './screens/TransactionsScreen';
import { createStackNavigator } from '@react-navigation/stack';
import { Transaction } from './utils/storage';  // Transaction tipini import edin
import AboutScreen from './screens/AboutScreen';

// Navigation için tip tanımlaması
type RootStackParamList = {
  Home: undefined;
  Transactions: { transactions: Transaction[] };
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
              <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Transactions" component={TransactionsScreen} options={{ headerShown: false }} />
              <Stack.Screen name="About" component={AboutScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </CurrencyProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}