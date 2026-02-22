'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/lib/cart-store';
import { Menu, X, Instagram } from 'lucide-react';

export default function Header() {
    const totalItems = useCartStore((state) => state.totalItems);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isMenuOpen]);

    const closeMenu = () => setIsMenuOpen(false);

    const primaryLinks = [
        { href: '/shop', label: 'Shop' },
        { href: '/collections', label: 'Collections' },
        { href: '/brand', label: 'Brand' },
        { href: '/lookbook', label: 'Lookbook' },
        { href: '/contact', label: 'Contact' },
    ];

    const utilityLinks = [
        { href: '/faq', label: 'FAQ' },
        { href: '/size-guide', label: 'Size Guide' },
        { href: '/track', label: 'Track Order' },
        { href: '/cart', label: `Cart (${mounted ? totalItems : 0})` },
    ];

    return (
        <>
            <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-neutral-100">
                <div className="flex h-16 items-center justify-between px-6 md:px-12">
                    {/* Hamburger — mobile only */}
                    <button
                        className="md:hidden p-2 -ml-2 text-neutral-900"
                        onClick={() => setIsMenuOpen(true)}
                        aria-label="Open menu"
                        type="button"
                    >
                        <Menu className="w-5 h-5" strokeWidth={1.5} />
                    </button>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex gap-8">
                        <Link href="/shop" className="text-xs uppercase tracking-widest hover:text-neutral-400 transition-colors">Shop</Link>
                        <Link href="/collections" className="text-xs uppercase tracking-widest hover:text-neutral-400 transition-colors">Collections</Link>
                        <Link href="/brand" className="text-xs uppercase tracking-widest hover:text-neutral-400 transition-colors">Brand</Link>
                    </nav>

                    {/* Logo — centred on mobile */}
                    <Link href="/" className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
                        <Image
                            src="/logo-black.png"
                            alt="iby_closet"
                            width={160}
                            height={40}
                            className="h-8 w-auto mix-blend-multiply"
                            priority
                        />
                    </Link>

                    <div className="flex items-center gap-6">
                        <Link href="/track" className="hidden md:block text-xs uppercase tracking-widest hover:text-neutral-400 transition-colors">Track Order</Link>
                        <Link href="/cart" className="text-xs uppercase tracking-widest hover:text-neutral-400 transition-colors">
                            Cart ({mounted ? totalItems : 0})
                        </Link>
                    </div>
                </div>
            </header>

            {/* Backdrop — fades in behind the panel */}
            <div
                className={`fixed inset-0 z-[199] bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 ${
                    isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={closeMenu}
                aria-hidden="true"
            />

            {/* Slide-in panel from left */}
            <div
                className={`fixed top-0 left-0 h-full w-[82%] max-w-[340px] z-[200] bg-[#0a0a0a] flex flex-col transition-transform duration-300 ease-out ${
                    isMenuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Panel header */}
                <div className="flex items-center justify-between px-6 pt-5 pb-4 shrink-0">
                    <Link href="/" onClick={closeMenu}>
                        <Image
                            src="/logo-white.png"
                            alt="iby_closet"
                            width={100}
                            height={26}
                            className="h-6 w-auto opacity-80"
                        />
                    </Link>
                    <button
                        onClick={closeMenu}
                        className="p-1.5 -mr-1.5 text-white/40 hover:text-white/80 transition-colors"
                        aria-label="Close menu"
                        type="button"
                    >
                        <X className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                </div>

                {/* Primary links */}
                <nav className="flex-1 px-6 pt-4 overflow-hidden">
                    <div className="border-t border-white/[0.07]">
                        {primaryLinks.map(({ href, label }) => (
                            <Link
                                key={href}
                                href={href}
                                onClick={closeMenu}
                                className="flex items-center justify-between py-4 border-b border-white/[0.07] text-white text-xl font-extralight uppercase tracking-[0.08em] hover:text-white/60 transition-colors"
                            >
                                {label}
                            </Link>
                        ))}
                    </div>

                    {/* Utility links */}
                    <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
                        {utilityLinks.map(({ href, label }) => (
                            <Link
                                key={href}
                                href={href}
                                onClick={closeMenu}
                                className="text-[11px] uppercase tracking-[0.2em] text-white/30 hover:text-white/60 transition-colors"
                            >
                                {label}
                            </Link>
                        ))}
                    </div>
                </nav>

                {/* Bottom — social */}
                <div className="shrink-0 px-6 pb-8 pt-4 border-t border-white/[0.07]">
                    <a
                        href="https://instagram.com/iby_closet"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/30 hover:text-white/60 transition-colors"
                    >
                        <Instagram className="w-3.5 h-3.5" />
                        @iby_closet
                    </a>
                </div>
            </div>
        </>
    );
}
