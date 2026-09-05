import React, { useEffect } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
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

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];
const tabIconNames: Record<keyof MainTabParamList, { active: IoniconName; inactive: IoniconName }> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Learn: { active: 'book', inactive: 'book-outline' },
  TutorTab: { active: 'sparkles', inactive: 'sparkles-outline' },
  Explore: { active: 'compass', inactive: 'compass-outline' },
  ProfileTab: { active: 'person', inactive: 'person-outline' }
};

function TabIcon({ routeName, focused }: { routeName: keyof MainTabParamList; focused: boolean }) {
  const names = tabIconNames[routeName];
  const tutor = routeName === 'TutorTab';
  const iconColor = focused ? (tutor ? '#FFFFFF' : colors.primary) : '#8592A5';
  return <View style={[styles.tabIconShell, focused && styles.tabIconShellActive, tutor && styles.tutorIconShell, tutor && focused && styles.tutorIconShellActive]}>
    <Ionicons name={focused ? names.active : names.inactive} size={tutor ? 22 : 21} color={iconColor} />
  </View>;
}

function MainTabs() {
  return <Tabs.Navigator screenOptions={({ route }) => ({
    headerShown: false,
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: '#8592A5',
    tabBarHideOnKeyboard: true,
    tabBarLabelStyle: { fontSize: 10.5, lineHeight: 13, fontWeight: '800', marginTop: 0 },
    tabBarItemStyle: { paddingTop: 6, paddingBottom: 4 },
    tabBarIconStyle: { marginBottom: 1 },
    tabBarStyle: {
      position: 'absolute',
      left: 12,
      right: 12,
      bottom: 10,
      height: 74,
      paddingTop: 5,
      paddingBottom: 6,
      borderTopWidth: 0,
      borderWidth: 1,
      borderColor: '#E4EBF3',
      borderRadius: 24,
      backgroundColor: 'rgba(255,255,255,0.98)',
      elevation: 16,
      shadowColor: '#173152',
      shadowOpacity: .13,
      shadowRadius: 22,
      shadowOffset: { width: 0, height: 8 }
    },
    tabBarIcon: ({ focused }) => <TabIcon routeName={route.name} focused={focused} />
  })}>
    <Tabs.Screen name="Home" component={HomeScreen} options={{ title: 'হোম' }} />
    <Tabs.Screen name="Learn" component={LearnScreen} options={{ title: 'শিখুন' }} />
    <Tabs.Screen name="TutorTab" component={TutorScreen} options={{ title: 'AI Tutor' }} />
    <Tabs.Screen name="Explore" component={ExploreScreen} options={{ title: 'গাইড' }} />
    <Tabs.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'প্রোফাইল' }} />
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

  return <><StatusBar style="dark" /><NavigationContainer theme={theme}>
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
      <Stack.Screen name="Content" component={ContentScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  </NavigationContainer></>;
}

const styles = StyleSheet.create({
  tabIconShell: {
    width: 36,
    height: 30,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabIconShellActive: { backgroundColor: colors.primarySoft },
  tutorIconShell: {
    width: 40,
    height: 34,
    borderRadius: 14,
    backgroundColor: '#EEF4FB',
    borderWidth: 1,
    borderColor: '#E0E9F4'
  },
  tutorIconShellActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryStrong,
    shadowColor: colors.primary,
    shadowOpacity: .22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5
  }
});
