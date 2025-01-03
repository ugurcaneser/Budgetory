import { SafeAreaProvider } from 'react-native-safe-area-context';
import "./global.css"
import HomeScreen from './screens/HomeScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <HomeScreen />
    </SafeAreaProvider>
  );
}