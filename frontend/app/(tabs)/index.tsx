import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DiscoveryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Discovery Screen - Coming in Phase 2</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 18,
    color: '#666',
  },
});