import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MusicProvider } from './src/context/MusicContext';
import HomeScreen from './src/screens/HomeScreen';

export default function App() {
  return (
    <View style={styles.container}>
      <MusicProvider>
        <HomeScreen />
      </MusicProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
});