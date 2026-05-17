import React from 'react';
import Navbar from '../components/Navbar';
import StoryHero from '../components/StoryHero';
import OurStory from '../components/Ourstory';
import StoryDetails from '../components/StoryDetails';
import StoryMemories from '../components/StoryMemories';

export default function OurStoryPage() {
  return (
    <main>
      <Navbar />
      <StoryHero />
      <OurStory />
      <StoryDetails />
      <StoryMemories />
    </main>
  );
}
