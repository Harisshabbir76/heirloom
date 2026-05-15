"use client";

import React from "react";
import "../styles/Marquee.css";

const Marquee: React.FC = () => {
  const text = "Fast shipping on all orders";
  // Repeat the text enough times to fill the screen and then duplicate for the loop
  const items = Array(14).fill(text); 

  return (
    <div className="marquee-container">
      <div className="marquee-inner">
        {items.map((item, index) => (
          <span key={`first-${index}`} className="marquee-item">
            {item}
          </span>
        ))}
        {/* Duplicate set for seamless loop */}
        {items.map((item, index) => (
          <span key={`second-${index}`} className="marquee-item">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Marquee;
