"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import heroLogo from "../images/hero_logo.png";
import "../styles/HeroSection.css";

const HeroSection: React.FC = () => {
  return (
    <section id="hero" className="hero-section">
      <div className="hero-content">
        {/* Logo */}
        <div className="hero-logo-container">
          <Image
            src={heroLogo}
            alt="Heirloom Logo"
            className="hero-logo-img"
            priority
          />
        </div>

        {/* Main Heading */}
        <h1 className="hero-heading">
          THIS IS MORE THAN A JEWELRY BOX.
        </h1>

        {/* Script Subheading */}
        <h2 className="hero-script">
          This is where your memories live.
        </h2>

        {/* Paragraph Text */}
        <p className="hero-paragraph">
          THOUGHTFULLY CRAFTED TO HOLD NOT JUST YOUR PIECES,<br />
          BUT THE MOMENTS, MILESTONES, AND MEANING BEHIND THEM.
        </p>

        {/* CTA Button */}
        <Link href="/shop" className="hero-cta">
          SHOP NOW
        </Link>
      </div>

    </section>
  );
};

export default HeroSection;