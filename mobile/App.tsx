import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const DEFAULT_APP_URL = 'https://nebularc18.github.io/CipherBox/';
const APP_URL =
  process.env.EXPO_PUBLIC_CIPHERBOX_URL ||
  process.env.EXPO_PUBLIC_CIPHERFORGE_URL ||
  DEFAULT_APP_URL;
const WEBVIEW_VIEWPORT_SCRIPT = `
  (function () {
    const viewport = document.querySelector('meta[name="viewport"]') || document.createElement('meta');
    viewport.setAttribute('name', 'viewport');
    viewport.setAttribute('content', 'width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
    if (!viewport.parentNode) {
      document.head.appendChild(viewport);
    }

    const style = document.getElementById('cipherforge-mobile-webview-lock') || document.createElement('style');
    style.id = 'cipherforge-mobile-webview-lock';
    style.textContent = [
      'html, body, #root { width: 100% !important; max-width: 100vw !important; overflow-x: hidden !important; overscroll-behavior-x: none !important; touch-action: pan-y !important; }',
      '* { overscroll-behavior-x: none !important; }',
      '@media (max-width: 640px) {',
      '.app-frame { width: 100% !important; max-width: 100vw !important; overflow-x: hidden !important; }',
      '.sidebar { width: 100% !important; max-width: 100vw !important; padding: 18px 16px !important; overflow: hidden !important; }',
      '.side-nav { display: grid !important; grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 8px !important; }',
      '.side-nav-button { width: 100% !important; min-width: 0 !important; padding: 10px !important; }',
      '.side-nav-button span { overflow: hidden !important; text-overflow: ellipsis !important; white-space: nowrap !important; }',
      '.app-shell { width: 100% !important; max-width: 100vw !important; padding: 22px 16px 96px !important; overflow: hidden !important; }',
      '.dashboard-view { gap: 32px !important; }',
      '.hero-panel { padding: 28px 24px !important; }',
      '.hero-panel h1 { font-size: 2.35rem !important; line-height: 1.05 !important; word-break: break-word !important; }',
      '.dashboard { grid-template-columns: minmax(0, 1fr) !important; gap: 16px !important; }',
      '.tool-card { min-width: 0 !important; padding: 20px !important; }',
      '.tool-card-description { overflow-wrap: anywhere !important; }',
      '.inline-tool-container { padding: 20px !important; }',
      '.section-heading { align-items: flex-start !important; flex-direction: column !important; gap: 16px !important; }',
      '.control-strip { width: 100% !important; }',
      '.mode-button { flex: 1 !important; padding-inline: 10px !important; }',
      '.cleanup-grid { grid-template-columns: minmax(0, 1fr) !important; }',
      '}',
    ].join(' ');
    if (!style.parentNode) {
      document.head.appendChild(style);
    }

    document.documentElement.style.overflowX = 'hidden';
    document.body.style.overflowX = 'hidden';
  })();
  true;
`;

export default function App() {
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const reload = () => {
    setHasError(false);
    setIsLoading(true);
    webViewRef.current?.reload();
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <View style={styles.container}>
          <View style={styles.webShell}>
            {hasError ? (
              <View style={styles.errorPanel}>
                <Text style={styles.errorTitle}>Could not load CipherBox</Text>
                <Text style={styles.errorBody}>
                  Check the URL in EXPO_PUBLIC_CIPHERBOX_URL or make sure the
                  hosted web app is reachable from this device.
                </Text>
                <Pressable style={styles.primaryButton} onPress={reload}>
                  <Text style={styles.primaryButtonText}>Try again</Text>
                </Pressable>
              </View>
            ) : (
              <>
                <WebView
                  ref={webViewRef}
                  source={{ uri: APP_URL }}
                  style={styles.webView}
                  onLoadStart={() => setIsLoading(true)}
                  onLoadEnd={() => setIsLoading(false)}
                  onError={() => {
                    setHasError(true);
                    setIsLoading(false);
                  }}
                  onHttpError={() => {
                    setHasError(true);
                    setIsLoading(false);
                  }}
                  injectedJavaScriptBeforeContentLoaded={WEBVIEW_VIEWPORT_SCRIPT}
                  scalesPageToFit={false}
                  overScrollMode="never"
                  showsHorizontalScrollIndicator={false}
                  setBuiltInZoomControls={false}
                  setDisplayZoomControls={false}
                  textZoom={100}
                  javaScriptEnabled
                  domStorageEnabled
                  pullToRefreshEnabled
                  startInLoadingState
                />
                {isLoading ? (
                  <View style={styles.loadingOverlay}>
                    <ActivityIndicator color="#10b981" />
                  </View>
                ) : null}
              </>
            )}
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  webShell: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  webView: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(9, 9, 11, 0.6)',
  },
  errorPanel: {
    flex: 1,
    padding: 24,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  errorTitle: {
    color: '#f4f4f5',
    fontSize: 24,
    fontWeight: '700',
  },
  errorBody: {
    marginTop: 10,
    color: '#a1a1aa',
    fontSize: 15,
    lineHeight: 22,
  },
  primaryButton: {
    marginTop: 24,
    minHeight: 44,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#030712',
    fontSize: 15,
    fontWeight: '700',
  },
});
