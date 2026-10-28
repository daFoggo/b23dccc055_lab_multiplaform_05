/**
 * ChatApp - Chat realtime
 * @format
 */

import { StatusBar } from 'react-native';
import { PaperProvider, Text } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <StatusBar barStyle="dark-content" />
        <Text>ChatApp</Text>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

export default App;
