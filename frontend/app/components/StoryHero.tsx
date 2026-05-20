import React from 'react';
import '../styles/StoryHero.css';

const StoryHero = () => {
  return (
    <section className="story-hero-section">
      <div className="story-hero-overlay"></div>
      <div className="story-hero-image-dim"></div>
      <div className="story-hero-content">
        <h1 className="story-hero-heading">OUR STORY</h1>
        <h2 className="story-hero-script">Where Every Piece Holds a Story</h2>
        <p className="story-hero-text">
          AT HEIRLOOM BY SK, WE BELIEVE THAT JEWELRY IS NEVER JUST SOMETHING YOU WEAR. 
          IT IS SOMETHING YOU KEEP — A QUIET REFLECTION OF MOMENTS, MEMORIES, AND MEANING.
        </p>
        <a href="#story-intro" className="story-hero-cta">READ MORE</a>
      </div>
    </section>
  );
};

export default StoryHero;