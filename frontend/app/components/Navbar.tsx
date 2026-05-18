"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import "../styles/Navbar.css";
import CartIcon from "./cart/CartIcon";


export default function Navbar() {
  const pathname = usePathname();
  const isDefaultNavbarPage =
    pathname === "/" ||
    pathname === "/our-story" ||
    pathname === "/contact" ||
    pathname === "/faq";

  // Light navbar on all other pages
  const isLightNavbarPage = !isDefaultNavbarPage;

  return (
    <nav className={`navbar ${isLightNavbarPage ? "navbar--light" : ""}`}>
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
          <div className="nav-icons">
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
                width="15"
                height="15"
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
            <CartIcon />
          </div>

          {/* Order Now CTA */}
          <Link href="/shop" className="order-now-btn">
            Order Now
          </Link>
        </div>
      </div>
    </nav>
  );
}
