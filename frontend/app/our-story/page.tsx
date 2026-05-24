import React from 'react';
import StoryHero from '../components/StoryHero';
import OurStory from '../components/Ourstory';
import StoryDetails from '../components/StoryDetails';
import StoryMemories from '../components/StoryMemories';
import { fetchSiteContent, getOurStoryImageUrl } from '../lib/siteContent';

export default async function OurStoryPage() {
  const content = await fetchSiteContent().catch(() => ({ ourStoryImages: [] }));
  const getImage = (key: string) => getOurStoryImageUrl(content.ourStoryImages, key);

  return (
    <main>
      <StoryHero imageUrl={getImage('hero')} />
      <OurStory
        images={{
          key: getImage('key'),
          box1: getImage('box1'),
          box2: getImage('box2'),
          keychain: getImage('keychain'),
          ring: getImage('ring'),
        }}
      />
      <StoryDetails
        images={{
          gloves: getImage('gloves'),
          bell: getImage('bell'),
          necklace: getImage('necklace'),
        }}
      />
      <StoryMemories
        imageUrls={[
          getImage('memory1'),
          getImage('memory2'),
          getImage('memory3'),
          getImage('memory4'),
          getImage('memory5'),
          getImage('memory6'),
        ]}
      />
    </main>
  );
}
