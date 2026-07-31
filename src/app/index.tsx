import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home placeholder</Text>
      <Text style={styles.body}>Router, SQLite, and persisted preferences are ready.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  title: {
    color: '#172B4D',
    fontSize: 24,
    fontWeight: '700',
  },
  body: {
    color: '#44546F',
    fontSize: 16,
    textAlign: 'center',
  },
});
