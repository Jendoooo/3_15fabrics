'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Instagram, MessageCircle, Facebook } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setMessage({ type: 'error', text: 'Please enter your email address.' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: normalizedEmail, source: 'footer' }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? 'Could not join waitlist right now.');
      }

      setMessage({ type: 'success', text: 'You are on the list. Watch your inbox for drops.' });
      setEmail('');
    } catch (submitError) {
      setMessage({
        type: 'error',
        text:
          submitError instanceof Error
            ? submitError.message
            : 'Could not join waitlist right now.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-brand-dark px-6 py-16 text-white md:px-12">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 md:grid-cols-3">
        <div>
          <div className="mb-6">
            <Image src="/images/logo.png" alt="3:15 Fabrics" width={100} height={50} className="w-auto h-12 object-contain bg-white rounded-sm px-2 py-1" />
          </div>
          <p className="mb-6 text-sm leading-relaxed text-neutral-400">
            Premium fabrics, sourced from around the world. Based in Epe, Lagos.
          </p>
          <div className="flex gap-4">
            <a href="https://instagram.com/3_15fabrics" target="_blank" rel="noreferrer" aria-label="Instagram" className="text-white hover:text-brand-gold transition-colors">
              <Instagram size={18} />
            </a>
            <a href="https://www.tiktok.com/@315fabrics" target="_blank" rel="noreferrer" aria-label="TikTok" className="text-white hover:text-brand-gold transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9a6.33 6.33 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.3a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.18 8.18 0 0 0 4.76 1.52V6.84a4.84 4.84 0 0 1-1-.15z" /></svg>
            </a>
            <a href="https://web.facebook.com/profile.php?id=100057922604897" target="_blank" rel="noreferrer" aria-label="Facebook" className="text-white hover:text-brand-gold transition-colors">
              <Facebook size={18} />
            </a>
            <a href="https://wa.me/2349066609177" target="_blank" rel="noreferrer" aria-label="WhatsApp" className="text-white hover:text-brand-gold transition-colors">
              <MessageCircle size={18} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="mb-6 text-sm uppercase tracking-widest text-brand-gold">Explore</h4>
          <ul className="space-y-3 text-sm text-neutral-400">
            <li>
              <Link href="/shop" className="transition-colors hover:text-white">Shop</Link>
            </li>
            <li>
              <Link href="/collections" className="transition-colors hover:text-white">Collections</Link>
            </li>
            <li>
              <Link href="/brand" className="transition-colors hover:text-white">About Us</Link>
            </li>
            <li>
              <Link href="/lookbook" className="transition-colors hover:text-white">Lookbook</Link>
            </li>
            <li>
              <Link href="/yardage-guide" className="transition-colors hover:text-white">Yardage Guide</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-6 text-sm uppercase tracking-widest text-brand-gold">Help</h4>
          <ul className="space-y-3 text-sm text-neutral-400">
            <li>
              <Link href="/faq" className="transition-colors hover:text-white">FAQ</Link>
            </li>
            <li>
              <Link href="/contact" className="transition-colors hover:text-white">Contact</Link>
            </li>
            <li>
              <Link href="/track" className="transition-colors hover:text-white">Track Order</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-7xl border-t border-white/10 pt-12">
        <div className="max-w-md">
          <h4 className="mb-6 text-sm uppercase tracking-widest text-brand-gold">Join the Waitlist</h4>
          <p className="mb-4 text-sm text-neutral-400">
            New fabrics, asoebi sets, and exclusive offers — straight to your inbox.
          </p>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email Address"
              className="w-full border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm text-white transition-colors focus:border-white focus:outline-none"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-white px-4 py-2 text-sm uppercase tracking-widest text-black transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:bg-neutral-300"
            >
              {isSubmitting ? '...' : 'Join'}
            </button>
          </form>
          {message ? (
            <p className={`mt-3 text-xs ${message.type === 'error' ? 'text-red-300' : 'text-emerald-300'}`}>
              {message.text}
            </p>
          ) : null}
        </div>
      </div>
      <div className="mx-auto mt-16 flex max-w-7xl items-center justify-between border-t border-white/10 pt-8 text-xs text-neutral-500">
        <p>© {new Date().getFullYear()} 3:15 Fabrics. All rights reserved.</p>
        <p>Epe, Lagos</p>
      </div>
    </footer>
  );
}
