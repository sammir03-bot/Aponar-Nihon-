import React, { useEffect } from 'react';
import { Linking, Text } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import HomeScreen from './src/screens/HomeScreen';
import LearnScreen from './src/screens/LearnScreen';
import ExploreScreen from './src/screens/ExploreScreen';
import TutorScreen from './src/screens/TutorScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import HalalScannerScreen from './src/screens/HalalScannerScreen';
import DailyNewsScreen from './src/screens/DailyNewsScreen';
import CVBuilderScreen from './src/screens/CVBuilderScreen';
import AllSectionsScreen from './src/screens/AllSectionsScreen';
import ContentScreen from './src/screens/ContentScreen';
import { handleAuthUrl } from './src/supabase';
import { colors } from './src/theme';
import type { MainTabParamList, RootStackParamList } from './src/navigation';

Notifications.setNotificationHandler({ handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }) });
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();
const tabIcons: Record<keyof MainTabParamList, string> = { Home: '⌂', Learn: '本', TutorTab: '✦', Explore: '⌘', ProfileTab: '●' };

function MainTabs() {
  return <Tabs.Navigator screenOptions={({ route }) => ({
    headerShown: false,
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: '#8793A3',
    tabBarHideOnKeyboard: true,
    tabBarLabelStyle: { fontSize: 11, fontWeight: '800', marginTop: 1 },
    tabBarItemStyle: { paddingTop: 7 },
    tabBarStyle: {
      height: 72,
      paddingBottom: 8,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: '#FFFFFF',
      elevation: 12,
      shadowColor: '#234367',
      shadowOpacity: .08,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: -4 }
    },
    tabBarIcon: ({ color }) => <Text style={{ color, fontSize: route.name === 'TutorTab' ? 24 : 22, fontWeight: '900' }}>{tabIcons[route.name]}</Text>
  })}>
    <Tabs.Screen name="Home" component={HomeScreen} options={{ title: 'হোম' }} />
    <Tabs.Screen name="Learn" component={LearnScreen} options={{ title: 'শিখুন' }} />
    <Tabs.Screen name="TutorTab" component={TutorScreen} options={{ title: 'AI Tutor' }} />
    <Tabs.Screen name="Explore" component={ExploreScreen} options={{ title: 'Explore' }} />
    <Tabs.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile' }} />
  </Tabs.Navigator>;
}

function processAuthUrl(url: string | null) {
  if (!url) return;
  void handleAuthUrl(url).catch((error) => {
    console.warn('Aponar Nihon auth callback failed', error instanceof Error ? error.message : error);
  });
}

export default function App() {
  useEffect(() => {
    Linking.getInitialURL().then(processAuthUrl).catch(() => {});
    const sub = Linking.addEventListener('url', ({ url }) => processAuthUrl(url));
    return () => sub.remove();
  }, []);

  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: colors.primary,
      background: colors.bg,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.primary
    }
  };

  return <><StatusBar style="dark" backgroundColor="#FFFFFF" /><NavigationContainer theme={theme}>
    <Stack.Navigator screenOptions={{
      headerBackTitle: 'Back',
      headerTintColor: colors.text,
      headerTitleStyle: { fontWeight: '800' },
      headerStyle: { backgroundColor: '#FFFFFF' },
      headerShadowVisible: false,
      contentStyle: { backgroundColor: colors.bg }
    }}>
      <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="Tutor" component={TutorScreen} options={{ title: 'AI Tutor' }} />
      <Stack.Screen name="HalalScanner" component={HalalScannerScreen} options={{ title: 'Halal Scanner' }} />
      <Stack.Screen name="DailyNews" component={DailyNewsScreen} options={{ title: 'Japan Daily News' }} />
      <Stack.Screen name="CVBuilder" component={CVBuilderScreen} options={{ title: 'CV Builder' }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
      <Stack.Screen name="AllSections" component={AllSectionsScreen} options={{ title: 'সব সেকশন' }} />
      <Stack.Screen name="Content" component={ContentScreen} options={({ route }) => ({ title: route.params.title })} />
    </Stack.Navigator>
  </NavigationContainer></>;
}
