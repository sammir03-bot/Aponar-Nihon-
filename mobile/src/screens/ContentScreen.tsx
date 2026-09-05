import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text } from 'react-native';
import { NativeContent, Screen } from '../components';
import { getMobileContent, getMobileContentIndex, type MobileContent } from '../api';

export default function ContentScreen({ route }: { route: any }) {
  const [content, setContent] = useState<MobileContent | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        let id: string | undefined = route.params?.id;
        if (!id && route.params?.path) {
          const index = await getMobileContentIndex();
          id = index.pages.find((item) => item.path === route.params.path)?.id;
        }
        if (!id) throw new Error('Content mapping পাওয়া যায়নি।');
        const result = await getMobileContent(id);
        if (active) setContent(result);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Content load করা যায়নি।');
      }
    })();
    return () => { active = false; };
  }, [route.params?.id, route.params?.path]);
  return <Screen>{!content && !error ? <ActivityIndicator /> : null}{error ? <Text>{error}</Text> : null}{content ? <NativeContent blocks={content.blocks} sourcePath={content.path} /> : null}</Screen>;
}
