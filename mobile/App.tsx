import { useMemo, useRef, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Constants from 'expo-constants'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import { WebView, type WebViewNavigation } from 'react-native-webview'

declare const process: {
  env: {
    EXPO_PUBLIC_CIPHERFORGE_URL?: string
  }
}

function getDefaultWebUrl() {
  const configuredUrl = process.env.EXPO_PUBLIC_CIPHERFORGE_URL

  if (configuredUrl) {
    return configuredUrl
  }

  const hostUri = Constants.expoConfig?.hostUri ?? Constants.expoGoConfig?.debuggerHost
  const host = hostUri?.split(':')[0]

  if (host) {
    return `http://${host}:5173/`
  }

  return 'http://localhost:5173/'
}

const disableZoomScript = `
  (function () {
    var viewport = document.querySelector('meta[name="viewport"]');
    var content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';

    if (viewport) {
      viewport.setAttribute('content', content);
    } else {
      viewport = document.createElement('meta');
      viewport.setAttribute('name', 'viewport');
      viewport.setAttribute('content', content);
      document.head.appendChild(viewport);
    }

    document.documentElement.style.touchAction = 'manipulation';
    document.documentElement.style.overflowX = 'hidden';
    if (document.body) {
      document.body.style.overflowX = 'hidden';
      document.body.style.width = '100%';
    }
  })();
  true;
`

export default function App() {
  const webUrl = useMemo(() => getDefaultWebUrl(), [])
  const webViewRef = useRef<WebView>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [currentUrl, setCurrentUrl] = useState(webUrl)

  const handleNavigationChange = (event: WebViewNavigation) => {
    setCurrentUrl(event.url)
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <WebView
        ref={webViewRef}
        source={{ uri: webUrl }}
        style={styles.webview}
        originWhitelist={['http://*', 'https://*']}
        javaScriptEnabled
        domStorageEnabled
        injectedJavaScriptBeforeContentLoaded={disableZoomScript}
        injectedJavaScript={disableZoomScript}
        scalesPageToFit={false}
        textZoom={100}
        setSupportMultipleWindows={false}
        onLoadStart={() => {
          setIsLoading(true)
          setHasError(false)
        }}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false)
          setHasError(true)
        }}
        onNavigationStateChange={handleNavigationChange}
      />

      {isLoading && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator color="#39d7ad" />
        </View>
      )}

      {hasError && (
        <View style={styles.errorPanel}>
          <Text style={styles.errorTitle}>CipherForge is not reachable</Text>
          <Text style={styles.errorText}>
            Start the web dev server from the repo root with npm run dev -- --host 0.0.0.0, then reload.
          </Text>
          <Text style={styles.urlText}>{currentUrl}</Text>
          <TouchableOpacity
            style={styles.reloadButton}
            onPress={() => {
              setHasError(false)
              webViewRef.current?.reload()
            }}
          >
            <Text style={styles.reloadText}>Reload</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030a0f',
  },
  webview: {
    flex: 1,
    backgroundColor: '#030a0f',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#030a0f',
  },
  errorPanel: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 14,
    padding: 24,
    backgroundColor: '#030a0f',
  },
  errorTitle: {
    color: '#f3fffb',
    fontSize: 22,
    fontWeight: '700',
  },
  errorText: {
    color: '#9fb5b4',
    fontSize: 15,
    lineHeight: 22,
  },
  urlText: {
    color: '#39d7ad',
    fontSize: 13,
  },
  reloadButton: {
    marginTop: 6,
    borderRadius: 8,
    backgroundColor: '#39d7ad',
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  reloadText: {
    color: '#030a0f',
    fontSize: 15,
    fontWeight: '700',
  },
})
