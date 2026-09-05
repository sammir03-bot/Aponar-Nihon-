import React from 'react';
import { View } from 'react-native';
import { FeatureCard, Screen, SectionTitle } from '../components';
import { EXPLORE_FEATURES } from '../registry';
import { openFeature } from '../navigation';

export default function ExploreScreen({ navigation }: { navigation: any }) {
  return <Screen><SectionTitle title="Explore" subtitle="Career, Japan life, tools এবং সব website section।" /><View style={{ gap: 10 }}>{EXPLORE_FEATURES.map((feature) => <FeatureCard key={feature.id} feature={feature} onPress={() => openFeature(navigation, feature)} />)}</View></Screen>;
}
