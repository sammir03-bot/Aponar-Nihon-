import React, { useEffect } from 'react';
import { Linking, Text } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { useColorScheme } from 'react-native';
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
const tabIcons: Record<keyof MainTabParamList, string> = { Home: '🏠', Learn: '📚', TutorTab: '🤖', Explore: '🧭', ProfileTab: '👤' };

function MainTabs() {
  return <Tabs.Navigator screenOptions={({ route }) => ({ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.muted, tabBarStyle: { height: 66, paddingTop: 7, paddingBottom: 8 }, tabBarIcon: () => <Text style={{ fontSize: 21 }}>{tabIcons[route.name]}</Text> })}>
    <Tabs.Screen name="Home" component={HomeScreen} options={{ title: 'হোম' }} />
    <Tabs.Screen name="Learn" component={LearnScreen} options={{ title: 'শিখুন' }} />
    <Tabs.Screen name="TutorTab" component={TutorScreen} options={{ title: 'AI Tutor' }} />
    <Tabs.Screen name="Explore" component={ExploreScreen} options={{ title: 'Explore' }} />
    <Tabs.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile' }} />
  </Tabs.Navigator>;
}

export default function App() {
  const scheme = useColorScheme();
  const navRef = useNavigationContainerRef<RootStackParamList>();
  useEffect(() => {
    Linking.getInitialURL().then((url) => { if (url) handleAuthUrl(url); });
    const sub = Linking.addEventListener('url', ({ url }) => handleAuthUrl(url));
    return () => sub.remove();
  }, []);
  const theme = scheme === 'dark' ? { ...DarkTheme, colors: { ...DarkTheme.colors, primary: colors.primary } } : { ...DefaultTheme, colors: { ...DefaultTheme.colors, primary: colors.primary, background: colors.bg, card: colors.surface, text: colors.text, border: colors.border } };
  return <><StatusBar style={scheme === 'dark' ? 'light' : 'dark'} /><NavigationContainer ref={navRef} theme={theme}>
    <Stack.Navigator screenOptions={{ headerBackTitle: 'Back', headerTintColor: colors.text, headerShadowVisible: false }}>
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
