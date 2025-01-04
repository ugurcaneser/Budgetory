import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import "./global.css"
import HomeScreen from './screens/HomeScreen';
import { CurrencyProvider } from './context/CurrencyContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <CurrencyProvider>
        <HomeScreen />
        <StatusBar style="auto" />
      </CurrencyProvider>
    </SafeAreaProvider>
  );
}