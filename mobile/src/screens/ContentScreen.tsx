import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { getMobileContent } from '../api';
import { APP_ORIGIN } from '../config';
import { colors, radius } from '../theme';

const PAGE_BRIDGE = `
(function () {
  try {
    var style = document.createElement('style');
    style.textContent = 'body > header, body > .bottom, body > nav.bottom, body > .bottom-nav, body > .app-bottom-nav, body > .mobile-bottom-nav { display:none !important; } body { padding-top:0 !important; }';
    document.head.appendChild(style);
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'title', title: document.title || '' }));
    }
  } catch (e) {}
  true;
})();
`;

function pageUrl(path: string): string {
  const value = String(path || '').trim();
  if (/^https?:\/\//i.test(value)) return value;
  return `${APP_ORIGIN}/${value.replace(/^\/+/, '')}`;
}

function cleanPageTitle(value: string): string {
  return value
    .replace(/\s*[|·-]\s*আপনার নিহোন.*$/i, '')
    .replace(/\s*[|·-]\s*Aponar Nihon.*$/i, '')
    .trim();
}

export default function ContentScreen({ route, navigation }: { route: any; navigation: any }) {
  const webRef = useRef<WebView>(null);
  const directPath = route.params?.path as string | undefined;
  const contentId = route.params?.id as string | undefined;
  const [resolvedPath, setResolvedPath] = useState(directPath || '');
  const [resolveError, setResolveError] = useState('');
  const [webError, setWebError] = useState('');
  const [canGoBack, setCanGoBack] = useState(false);
  const [pageTitle, setPageTitle] = useState(route.params?.title || 'আপনার নিহোন');

  useEffect(() => {
    let active = true;
    setResolveError('');
    if (directPath) {
      setResolvedPath(directPath);
      return () => { active = false; };
    }
    if (!contentId) {
      setResolveError('এই সেকশনের page পাওয়া যায়নি।');
      return () => { active = false; };
    }
    setResolvedPath('');
    getMobileContent(contentId)
      .then((content) => { if (active) setResolvedPath(content.path); })
      .catch(() => { if (active) setResolveError('এই সেকশনটি এখন load করা যাচ্ছে না। আবার চেষ্টা করুন।'); });
    return () => { active = false; };
  }, [contentId, directPath]);

  const url = useMemo(() => resolvedPath ? pageUrl(resolvedPath) : '', [resolvedPath]);

  const goBack = () => {
    if (canGoBack) webRef.current?.goBack();
    else navigation.goBack();
  };

  const allowRequest = (requestUrl: string) => {
    if (!requestUrl || requestUrl === 'about:blank' || requestUrl.startsWith('data:')) return true;
    if (
      requestUrl.startsWith(APP_ORIGIN) ||
      requestUrl.startsWith('https://aponar-nihon.eu.cc') ||
      requestUrl.startsWith('https://sammir03-bot.github.io')
    ) return true;
    void Linking.openURL(requestUrl).catch(() => {});
    return false;
  };

  return <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
    <View style={styles.topBar}>
      <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={goBack} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
        <Ionicons name="chevron-back" size={23} color={colors.text} />
      </Pressable>
      <View style={styles.titleWrap}>
        <Text numberOfLines={1} style={styles.title}>{pageTitle}</Text>
        <Text numberOfLines={1} style={styles.subtitle}>আপনার নিহোন</Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Reload" onPress={() => webRef.current?.reload()} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
        <Ionicons name="refresh" size={20} color={colors.primary} />
      </Pressable>
    </View>

    {resolveError ? <View style={styles.center}>
      <View style={styles.errorCard}>
        <Ionicons name="cloud-offline-outline" size={32} color={colors.warning} />
        <Text style={styles.errorTitle}>Content load হয়নি</Text>
        <Text style={styles.errorText}>{resolveError}</Text>
        <Pressable onPress={() => navigation.goBack()} style={styles.errorButton}><Text style={styles.errorButtonText}>পিছনে যান</Text></Pressable>
      </View>
    </View> : null}

    {!resolveError && !url ? <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /><Text style={styles.loadingText}>Content প্রস্তুত হচ্ছে…</Text></View> : null}

    {!resolveError && url ? <View style={styles.webWrap}>
      <WebView
        ref={webRef}
        source={{ uri: url }}
        style={styles.web}
        startInLoadingState
        renderLoading={() => <View style={styles.webLoading}><ActivityIndicator size="large" color={colors.primary} /></View>}
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        allowsBackForwardNavigationGestures
        setSupportMultipleWindows={false}
        pullToRefreshEnabled
        injectedJavaScript={PAGE_BRIDGE}
        onLoadStart={() => setWebError('')}
        onNavigationStateChange={(state) => setCanGoBack(state.canGoBack)}
        onShouldStartLoadWithRequest={(request) => allowRequest(request.url)}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data || '{}');
            if (data.type === 'title' && typeof data.title === 'string') {
              const next = cleanPageTitle(data.title);
              if (next) setPageTitle(next);
            }
          } catch {}
        }}
        onError={(event) => setWebError(event.nativeEvent.description || 'Page load করা যায়নি।')}
      />
      {webError ? <View style={styles.webError}>
        <View style={{ flex: 1 }}><Text style={styles.webErrorTitle}>নেটওয়ার্ক সমস্যা</Text><Text numberOfLines={2} style={styles.webErrorText}>{webError}</Text></View>
        <Pressable onPress={() => webRef.current?.reload()} style={styles.retry}><Text style={styles.retryText}>আবার</Text></Pressable>
      </View> : null}
    </View> : null}
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  topBar: {
    minHeight: 58,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border
  },
  pressed: { opacity: .7, transform: [{ scale: .96 }] },
  titleWrap: { flex: 1, minWidth: 0 },
  title: { color: colors.text, fontSize: 16, lineHeight: 20, fontWeight: '900' },
  subtitle: { marginTop: 1, color: colors.muted, fontSize: 10.5, fontWeight: '700' },
  webWrap: { flex: 1, backgroundColor: colors.bg },
  web: { flex: 1, backgroundColor: colors.bg },
  webLoading: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 22, backgroundColor: colors.bg },
  loadingText: { marginTop: 10, color: colors.muted, fontSize: 13, fontWeight: '700' },
  errorCard: { width: '100%', maxWidth: 420, alignItems: 'center', padding: 22, borderRadius: radius.lg, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.border },
  errorTitle: { marginTop: 10, color: colors.text, fontSize: 18, fontWeight: '900' },
  errorText: { marginTop: 6, color: colors.muted, textAlign: 'center', fontSize: 13, lineHeight: 20 },
  errorButton: { marginTop: 15, backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: 18, paddingVertical: 11 },
  errorButtonText: { color: '#FFFFFF', fontWeight: '900' },
  webError: { position: 'absolute', left: 10, right: 10, bottom: 10, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 16, padding: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.border, shadowColor: '#173152', shadowOpacity: .13, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 8 },
  webErrorTitle: { color: colors.text, fontSize: 13, fontWeight: '900' },
  webErrorText: { marginTop: 2, color: colors.muted, fontSize: 11, lineHeight: 15 },
  retry: { borderRadius: 12, paddingHorizontal: 13, paddingVertical: 9, backgroundColor: colors.primarySoft },
  retryText: { color: colors.primary, fontWeight: '900', fontSize: 12 }
});
