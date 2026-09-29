import React, { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, type WebViewNavigation } from 'react-native-webview';
import { APP_ORIGIN } from '../config';
import { colors } from '../theme';

const KNOWN_INTERNAL_HOSTS = new Set([
  'aponarnihon.com',
  'www.aponarnihon.com',
  'app.aponar-nihon.workers.dev',
  'aponar-nihon.eu.cc'
]);

function hostOf(value: string) {
  try {
    return new URL(value).host.toLowerCase();
  } catch {
    return '';
  }
}

function siteUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${APP_ORIGIN}/${path.replace(/^\//, '')}`;
}

export default function ContentScreen({ route, navigation }: { route: any; navigation: any }) {
  const webRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const path = route.params?.path || '';
  const title = route.params?.title || 'Aponar Nihon';
  const initialUrl = useMemo(() => siteUrl(path), [path]);
  const internalHosts = useMemo(() => {
    const hosts = new Set(KNOWN_INTERNAL_HOSTS);
    const configured = hostOf(APP_ORIGIN);
    if (configured) hosts.add(configured);
    return hosts;
  }, []);

  const openExternally = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  const handleNavigation = (request: { url: string }) => {
    const url = request.url;
    if (!url) return false;
    if (/^(about:|data:|blob:|javascript:)/i.test(url)) return true;

    if (/^https?:/i.test(url)) {
      const host = hostOf(url);
      if (host && internalHosts.has(host)) return true;
      openExternally(url);
      return false;
    }

    openExternally(url);
    return false;
  };

  const syncNavigation = (state: WebViewNavigation) => {
    setCanGoBack(state.canGoBack);
    setCurrentUrl(state.url);
  };

  const goBack = () => {
    if (canGoBack) webRef.current?.goBack();
    else navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={goBack} accessibilityLabel="ফিরে যান">
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Text style={styles.url} numberOfLines={1}>{currentUrl || initialUrl}</Text>
        </View>
        <TouchableOpacity style={styles.iconButton} onPress={() => webRef.current?.reload()} accessibilityLabel="রিলোড করুন">
          <Text style={styles.actionIcon}>↻</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => openExternally(currentUrl || initialUrl)} accessibilityLabel="ব্রাউজারে খুলুন">
          <Text style={styles.actionIcon}>↗</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.webWrap}>
        <WebView
          ref={webRef}
          source={{ uri: initialUrl }}
          originWhitelist={['http://*', 'https://*', 'about:*', 'data:*']}
          javaScriptEnabled
          domStorageEnabled
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
          cacheEnabled
          allowsBackForwardNavigationGestures
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          setSupportMultipleWindows={false}
          onShouldStartLoadWithRequest={handleNavigation}
          onNavigationStateChange={syncNavigation}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          renderError={() => (
            <View style={styles.errorBox}>
              <Text style={styles.offlineIcon}>☁︎</Text>
              <Text style={styles.errorTitle}>পৃষ্ঠা লোড করা যায়নি</Text>
              <Text style={styles.errorText}>ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => webRef.current?.reload()}>
                <Text style={styles.retryText}>আবার চেষ্টা করুন</Text>
              </TouchableOpacity>
            </View>
          )}
        />
        {loading ? (
          <View style={styles.loader} pointerEvents="none">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  header: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface
  },
  headerCopy: { flex: 1, minWidth: 0, paddingHorizontal: 2 },
  title: { color: colors.text, fontSize: 15, fontWeight: '900' },
  url: { color: colors.muted, fontSize: 10, marginTop: 2 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSoft
  },
  backIcon: { color: colors.text, fontSize: 34, lineHeight: 34, fontWeight: '400' },
  actionIcon: { color: colors.text, fontSize: 22, lineHeight: 24, fontWeight: '700' },
  webWrap: { flex: 1, backgroundColor: colors.surface },
  loader: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.72)'
  },
  errorBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, backgroundColor: colors.surface },
  offlineIcon: { fontSize: 40, color: colors.muted },
  errorTitle: { marginTop: 12, color: colors.text, fontWeight: '900', fontSize: 18 },
  errorText: { marginTop: 6, color: colors.muted, textAlign: 'center', lineHeight: 21 },
  retryButton: { marginTop: 18, paddingHorizontal: 18, paddingVertical: 11, borderRadius: 14, backgroundColor: colors.primary },
  retryText: { color: '#fff', fontWeight: '900' }
});
