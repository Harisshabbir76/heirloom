'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import '../styles/StorySection.css';

// Import images
import Image1 from '../images/1.png';
import Image2 from '../images/2.png';
import Image3 from '../images/3.png';
import Image4 from '../images/4.png';
import Image5 from '../images/5.png';

const StorySection = () => {
  return (
    <section className="story-section">
      {/* Top Section */}
      <div className="story-top">
        <div className="story-top-left">
          <Image
            src={Image1}
            alt="Heirloom Box on Tray"
            className="main-box-img"
            priority
          />
        </div>
        <div className="story-top-right">
          <h2>FROM THE SOFTNESS OF THE VELVET LINING TO THE PRECISION OF EVERY DETAIL,</h2>
          <p >WE FOCUS ON CREATING TIMELESS PIECES THAT FEEL AS SPECIAL AS WHAT THEY CARRY.</p>
          <Link href="/our-story"> <button className="learn-more-btn">LEARN MORE ABOUT US</button> </Link>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="story-bottom">
        {/* Overlapping Polaroid Image 2 */}
        <div className="polaroid-container">
          <Image
            src={Image2}
            alt="Hand with Rings"
            className="polaroid-img"
          />
        </div>

        {/* Scattered Images 3, 4, 5 */}
        <Image
          src={Image3}
          alt="Hanging Key"
          className="image-key"
        />

        <Image
          src={Image4}
          alt="Woman in Green"
          className="image-woman"
        />

        <Image
          src={Image5}
          alt="Mobile and Purse"
          className="image-purse"
        />

        {/* Center Text Box */}
        <div className="center-content-box">
          <h3>THE SMALLEST OBJECTS OFTEN HOLD THE GREATEST MEANING.</h3>
          <p>This is where your stories rest. This is where your memories stay.</p>
        </div>
      </div>
    </section>
  );
};

export default StorySection;
