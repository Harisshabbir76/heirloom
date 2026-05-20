"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import "../styles/Navbar.css";
import CartIcon from "./cart/CartIcon";

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const isDefaultNavbarPage =
    pathname === "/" ||
    pathname === "/our-story" ||
    pathname === "/contact" ||
    pathname === "/faq" ||
    pathname === "/contact-us";

  // Light navbar on all other pages
  const isLightNavbarPage = !isDefaultNavbarPage;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    { href: "/our-story", label: "Our Story" },
  ];

  return (
    <>
      <nav className={`navbar ${isLightNavbarPage ? "navbar--light" : ""}`}>
        <div className="navbar-container">
          {/* Left Side - Hamburger (mobile only) or Nav Links (desktop) */}
          <div className="nav-left">
            {isMobile && (
              <button
                className="hamburger-btn"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            )}
            {!isMobile && (
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
            )}
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
              {/* Instagram Icon - hidden on mobile (shown in sidebar) */}
              {!isMobile && (
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
              )}

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

      {/* Mobile Sidebar */}
      <div
        className={`mobile-sidebar ${isMobileMenuOpen ? "mobile-sidebar--open" : ""}`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div
          className="mobile-sidebar__content"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="mobile-sidebar__close"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div className="mobile-sidebar__nav">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="mobile-sidebar__link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="mobile-sidebar__footer">
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mobile-sidebar__instagram"
              aria-label="Instagram"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}