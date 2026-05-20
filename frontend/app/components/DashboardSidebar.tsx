'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { clearAuthCookieClient } from '../lib/auth';

const links = [
    { href: '/dashboard', label: 'Catalog' },
    { href: '/dashboard/add-product', label: 'Add Products' },
    { href: '/dashboard/orders', label: 'Orders' },
];

export default function DashboardSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
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
        <aside className={`dashboard-sidebar ${isOpen ? 'is-open' : ''}`}>
            <div className="dashboard-sidebar__top">
                <Link href="/" className="dashboard-sidebar__brand" onClick={closeMenu}>Heirloom By SK</Link>
                <button
                    type="button"
                    className="dashboard-sidebar__toggle"
                    aria-label="Toggle dashboard navigation"
                    aria-expanded={isOpen}
                    onClick={() => setIsOpen((current) => !current)}
                >
                    <span />
                    <span />
                    <span />
                </button>
            </div>
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
    );
}
