import type { Feature } from './registry';

export type RootStackParamList = {
  Main: undefined;
  Tutor: undefined;
  HalalScanner: undefined;
  DailyNews: undefined;
  CVBuilder: undefined;
  Profile: undefined;
  AllSections: undefined;
  Content: { title: string; id?: string; path?: string };
};

export type MainTabParamList = {
  Home: undefined;
  Learn: undefined;
  TutorTab: undefined;
  Explore: undefined;
  ProfileTab: undefined;
};

export function openFeature(navigation: any, feature: Feature): void {
  if (feature.nativeRoute) {
    navigation.navigate(feature.nativeRoute);
    return;
  }
  if (feature.webPath) {
    navigation.navigate('Content', { title: feature.title, path: feature.webPath });
  }
}
