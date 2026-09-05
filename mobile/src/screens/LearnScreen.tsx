import React from 'react';
import { View } from 'react-native';
import { FeatureCard, Screen, SectionTitle } from '../components';
import { LEARNING_FEATURES } from '../registry';
import { openFeature } from '../navigation';

export default function LearnScreen({ navigation }: { navigation: any }) {
  return <Screen><SectionTitle title="Japanese Learning" subtitle="N5 থেকে advanced resources—website-এর learning content native format-এ।" /><View style={{ gap: 10 }}>{LEARNING_FEATURES.map((feature) => <FeatureCard key={feature.id} feature={feature} onPress={() => openFeature(navigation, feature)} />)}</View></Screen>;
}
