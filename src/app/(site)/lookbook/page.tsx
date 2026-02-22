import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Lookbook — 315 Fabrics',
  description: 'Campaign photography and editorial content from 315 Fabrics. Coming soon.',
};

export default function LookbookPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center text-white">
      <p className="mb-6 text-[10px] uppercase tracking-[0.5em] text-neutral-600">315 Fabrics</p>
      <h1 className="text-4xl font-light uppercase tracking-[0.3em] text-white md:text-6xl">
        The Lookbook
      </h1>
      <p className="mt-6 max-w-sm text-sm text-neutral-400">
        Campaign photos and editorial content are coming soon.
      </p>
      <p className="mt-2 text-sm text-neutral-500">
        Follow us on Instagram for a first look.
      </p>
      <a
        href="https://instagram.com/3_15fabrics"
        target="_blank"
        rel="noreferrer"
        className="mt-10 inline-block border border-white px-8 py-3 text-sm uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black"
      >
        @3_15fabrics
      </a>
      <div className="mt-12">
        <Link
          href="/shop"
          className="text-xs uppercase tracking-widest text-neutral-600 transition-colors hover:text-neutral-400"
        >
          ← Back to Shop
        </Link>
      </div>
    </main>
  );
}
