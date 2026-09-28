import type { Feature } from './registry';

export function openFeature(navigation: any, feature: Feature) {
  if (feature.nativeRoute) {
    navigation.navigate(feature.nativeRoute);
    return;
  }
  if (feature.webPath) {
    navigation.navigate('Content', { path: feature.webPath, title: feature.title });
  }
}

export function openContentPath(navigation: any, path: string, title?: string) {
  navigation.navigate('Content', { path, title });
}
