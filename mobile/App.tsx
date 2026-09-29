import React, { useEffect, useRef, useState } from 'react';
import { BackHandler, Linking, Platform, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { WebView, type WebViewNavigation } from 'react-native-webview';
import { APP_ORIGIN } from './src/config';

const appOrigin = APP_ORIGIN.replace(/\/$/, '');

function isInternalUrl(url: string): boolean {
  if (!url || url === 'about:blank') return true;
  if (url.startsWith('blob:') || url.startsWith('data:')) return true;

  try {
    const target = new URL(url);
    const app = new URL(appOrigin);
    return target.origin === app.origin;
  } catch {
    return false;
  }
}

export default function App() {
  const webViewRef = useRef<React.ElementRef<typeof WebView>>(null);
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!canGoBack) return false;
      webViewRef.current?.goBack();
      return true;
    });

    return () => subscription.remove();
  }, [canGoBack]);

  const onNavigationStateChange = (navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
  };

  const onShouldStartLoadWithRequest = (request: { url: string }) => {
    const { url } = request;
    if (isInternalUrl(url)) return true;

    // Keep the Aponar Nihon website as the visible app UI. External links,
    // telephone/email links and other app schemes open in the system handler.
    void Linking.openURL(url).catch(() => {});
    return false;
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <WebView
        ref={webViewRef}
        source={{ uri: appOrigin }}
        style={styles.webView}
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        setSupportMultipleWindows={false}
        allowsBackForwardNavigationGestures
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
        pullToRefreshEnabled
        onNavigationStateChange={onNavigationStateChange}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  webView: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  }
});
