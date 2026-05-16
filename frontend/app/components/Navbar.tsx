"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, useScroll } from "framer-motion";
import "../styles/Navbar.css";

interface NavbarProps {
  // Add any props if needed in the future
}

export default function Navbar({}: NavbarProps = {}) {
  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="navbar"
    >
      <div className="navbar-container">
        {/* Left Nav Links */}
        <div className="nav-links-left">
          <Link href="/" className="nav-tab">
            Home
          </Link>
          <Link href="/shop" className="nav-tab">
            Shop
          </Link>
          <Link href="/our-story" className="nav-tab">
            Our Story
          </Link>
        </div>

        {/* Center Brand */}
        <div className="brand-container">
          <Link href="/" className="brand-name">
            Heirloom By SK
          </Link>
        </div>

        {/* Right Actions */}
        <div className="nav-actions-right">
          {/* Instagram Icon */}
          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="icon-link"
            aria-label="Instagram"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </a>

          {/* Cart Icon */}
          <a href="/cart" className="icon-link" aria-label="Cart">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </a>

          {/* Order Now CTA */}
          <Link href="/order" className="order-now-btn">
            Order Now
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}