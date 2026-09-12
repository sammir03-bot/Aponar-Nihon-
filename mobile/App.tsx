import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Linking,
  PermissionsAndroid,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const APP_ORIGIN = (process.env.EXPO_PUBLIC_APP_ORIGIN || 'https://app.aponar-nihon.workers.dev').replace(/\/$/, '');

function isWebUrl(url: string) {
  return /^(https?:|about:blank)/i.test(url);
}

export default function App() {
  const webViewRef = useRef<WebView>(null);
  const cameraPermissionRequested = useRef(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [webKey, setWebKey] = useState(0);

  const requestScannerCameraIfNeeded = useCallback(async (url: string) => {
    if (Platform.OS !== 'android' || cameraPermissionRequested.current) return;

    const normalized = url.toLowerCase();
    const looksLikeScanner = normalized.includes('halal') && normalized.includes('scan');
    if (!looksLikeScanner) return;

    cameraPermissionRequested.current = true;
    try {
      const alreadyGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
      if (!alreadyGranted) {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
          title: 'Camera permission',
          message: 'Halal Scanner ব্যবহার করতে camera permission প্রয়োজন।',
          buttonPositive: 'Allow',
          buttonNegative: 'Cancel'
        });
      }
    } catch {
      // The website can still show its own camera fallback/error state.
    }
  }, []);

  useEffect(() => {
    const onHardwareBack = () => {
      if (canGoBack) {
        webViewRef.current?.goBack();
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onHardwareBack);
    return () => subscription.remove();
  }, [canGoBack]);

  const handleShouldStartLoad = useCallback((request: { url: string }) => {
    if (isWebUrl(request.url)) return true;

    void Linking.openURL(request.url).catch(() => {});
    return false;
  }, []);

  const retry = useCallback(() => {
    setCanGoBack(false);
    setWebKey((value) => value + 1);
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <WebView
          key={webKey}
          ref={webViewRef}
          source={{ uri: APP_ORIGIN }}
          style={styles.webView}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
          cacheEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          allowsBackForwardNavigationGestures
          setSupportMultipleWindows={false}
          onShouldStartLoadWithRequest={handleShouldStartLoad}
          onNavigationStateChange={(state) => {
            setCanGoBack(state.canGoBack);
            void requestScannerCameraIfNeeded(state.url);
          }}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loading}>
              <ActivityIndicator size="large" />
            </View>
          )}
          renderError={() => (
            <View style={styles.errorWrap}>
              <Text style={styles.errorTitle}>ইন্টারনেট সংযোগ পাওয়া যাচ্ছে না</Text>
              <Text style={styles.errorText}>সংযোগ ঠিক করে আবার চেষ্টা করুন।</Text>
              <Pressable style={styles.retryButton} onPress={retry}>
                <Text style={styles.retryText}>আবার চেষ্টা করুন</Text>
              </Pressable>
            </View>
          )}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  webView: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  loading: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF'
  },
  errorWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    backgroundColor: '#FFFFFF'
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    color: '#111827'
  },
  errorText: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: '#667085'
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#1689D8'
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800'
  }
});
