import { StyleSheet, Text, View } from 'react-native'

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>CipherBox</Text>
      <Text style={styles.message}>
        The current CipherBox interface is built for the web. Use the web build for the full toolset.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#030a0f',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    padding: 24,
  },
  message: {
    color: '#9fb5b4',
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 360,
    textAlign: 'center',
  },
  title: {
    color: '#f3fffb',
    fontSize: 32,
    fontWeight: '700',
  },
})
