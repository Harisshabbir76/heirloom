'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { clearAuthCookieClient } from '../lib/auth';

const links = [
    { href: '/heirloom/admin/panel/dashboard', label: 'products' },
    { href: '/heirloom/admin/panel/dashboard/add-product', label: 'Add Products' },
    { href: '/heirloom/admin/panel/dashboard/orders', label: 'Orders' },
    { href: '/heirloom/admin/panel/dashboard/faq', label: 'FAQ' },
    { href: '/heirloom/admin/panel/dashboard/policies', label: 'Policies' },
    { href: '/heirloom/admin/panel/dashboard/story-memories-shop', label: 'Story Memories Shop' },
    { href: '/heirloom/admin/panel/dashboard/coupons', label: 'Coupons' },
];

export default function DashboardSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    // Close sidebar on route change
    useEffect(() => {
        queueMicrotask(() => setIsOpen(false));
    }, [pathname]);

    // Lock body scroll while drawer is open
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const closeMenu = () => setIsOpen(false);

    async function logout() {
        try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
            const normalizedBase = apiBase.replace(/\/+$/u, '').replace(/\/api$/u, '');
            if (normalizedBase) {
                await fetch(`${normalizedBase}/api/auth/logout`, {
                    method: 'POST',
                    credentials: 'include',
                });
            }
        } finally {
            clearAuthCookieClient();
            router.replace('/login');
            router.refresh();
        }
    }

    return (
        <>
            {/* ── Mobile topbar (hidden on desktop via CSS) ── */}
            <div className="dashboard-topbar">
                <Link href="/" className="dashboard-topbar__brand">
                    Heirloom By SK
                </Link>
                <button
                    type="button"
                    className="dashboard-topbar__toggle"
                    aria-label="Toggle navigation menu"
                    aria-expanded={isOpen}
                    onClick={() => setIsOpen((v) => !v)}
                >
                    <span className={`hamburger-icon ${isOpen ? 'is-open' : ''}`}>
                        <span />
                        <span />
                        <span />
                    </span>
                </button>
            </div>

            {/* ── Backdrop (mobile only) ── */}
            {isOpen && (
                <div
                    className="dashboard-sidebar-backdrop"
                    onClick={closeMenu}
                    aria-hidden="true"
                />
            )}

            {/* ── Sidebar (fixed on desktop / right-side drawer on mobile) ── */}
            <aside className={`dashboard-sidebar ${isOpen ? 'is-open' : ''}`}>
                {/* Brand shown only on desktop (topbar shows it on mobile) */}
                <Link href="/" className="dashboard-sidebar__brand" onClick={closeMenu}>
                    Heirloom By SK
                </Link>

                <nav className="dashboard-sidebar__nav">
                    {links.map((link) => (
                        <Link
                            href={link.href}
                            key={link.href}
                            className={pathname === link.href ? 'is-active' : ''}
                            onClick={closeMenu}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <button type="button" className="dashboard-sidebar__logout" onClick={logout}>
                    Logout
                </button>
            </aside>
        </>
    );
}
