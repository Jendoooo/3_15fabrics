import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Our Story — iby_closet',
  description:
    'Lagos-based men\'s fashion brand by Ibrahim Hamed. Themed collections for the style-conscious modern man.',
};

export default function BrandPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-[60vh] items-center justify-center bg-black text-white">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />
        <div className="relative z-10 mx-auto max-w-3xl px-6 py-24 text-center">
          <h1 className="mb-6 text-4xl font-light uppercase tracking-[0.3em] md:text-5xl">
            Our Story
          </h1>
          <p className="text-sm uppercase tracking-[0.25em] text-neutral-400">
            Lagos &mdash; Founded by Ibrahim Hamed
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="mx-auto max-w-3xl px-6 py-20 text-center md:px-12">
        <p className="text-lg leading-relaxed text-neutral-700 md:text-xl">
          <strong className="font-semibold text-black">iby_closet</strong> is a
          Lagos-based men&apos;s fashion label founded by Ibrahim Hamed. Every piece is
          designed in-house — from concept sketches to finished garments — driven by a
          belief that African men deserve fashion that tells a story.
        </p>
      </section>

      {/* Philosophy */}
      <section className="border-t border-neutral-200 bg-neutral-50">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 py-20 md:grid-cols-2 md:px-12">
          <div className="flex flex-col justify-center">
            <h2 className="mb-6 text-2xl font-light uppercase tracking-widest">
              The Vision
            </h2>
            <p className="mb-4 text-sm leading-relaxed text-neutral-600">
              We create themed collections — each one a world of its own. Whether
              it&apos;s the nostalgic textures of{' '}
              <em>Back in the 90s</em> or the rhythm-infused cuts of{' '}
              <em>Rhythm &amp; Thread</em>, every drop is designed to make you feel
              something.
            </p>
            <p className="text-sm leading-relaxed text-neutral-600">
              iby_closet sits at the intersection of streetwear and editorial fashion —
              luxury without pretension, designed for the style-conscious Nigerian man
              who moves between boardrooms, studios, and nightlife with equal confidence.
            </p>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src="/images/instagram/post_4.jpg"
              alt="Ibrahim Hamed — founder of iby_closet"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-top"
            />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-6xl px-6 py-20 md:px-12">
        <h2 className="mb-12 text-center text-2xl font-light uppercase tracking-widest">
          What We Stand For
        </h2>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {[
            {
              title: 'Founder-Led Design',
              text: 'Every piece is designed by Ibrahim himself. No outsourced templates, no borrowed aesthetics — just original vision straight from Lagos.',
            },
            {
              title: 'Storytelling Through Fashion',
              text: 'Each collection has a narrative. Campaign shoots, lookbooks, and editorial content bring the story to life beyond the garments.',
            },
            {
              title: 'Accessible Luxury',
              text: 'Premium craftsmanship at considered price points. We believe great style shouldn\'t require compromise — on quality or on your wallet.',
            },
          ].map((value) => (
            <div key={value.title} className="text-center">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest">
                {value.title}
              </h3>
              <p className="text-sm leading-relaxed text-neutral-600">{value.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-neutral-200 bg-black py-20 text-center text-white">
        <h2 className="mb-6 text-2xl font-light uppercase tracking-widest">
          Explore the Collections
        </h2>
        <p className="mx-auto mb-8 max-w-lg text-sm leading-relaxed text-neutral-400">
          Discover the stories behind every drop — designed in Lagos for the
          modern man.
        </p>
        <Link
          href="/collections"
          className="inline-block border border-white px-10 py-4 text-sm uppercase tracking-widest transition-colors hover:bg-white hover:text-black"
        >
          View Collections
        </Link>
      </section>
    </div>
  );
}
