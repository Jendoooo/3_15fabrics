import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Our Story — 315 Fabrics',
  description:
    'Premium asoebi fabrics from Epe, Lagos. Founded by Ayodeji Modinat Ayeola-Musari — over 8 years in the fabric business.',
};

export default function BrandPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-[60vh] items-center justify-center bg-black text-white">
        <div className="relative z-10 mx-auto max-w-3xl px-6 py-24 text-center">
          <h1 className="mb-6 text-4xl font-light uppercase tracking-[0.3em] md:text-5xl">
            Our Story
          </h1>
          <p className="text-sm uppercase tracking-[0.25em] text-neutral-400">
            Epe, Lagos &mdash; Founded by Ayodeji Modinat Ayeola-Musari
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="mx-auto max-w-3xl px-6 py-20 text-center md:px-12">
        <p className="text-lg leading-relaxed text-neutral-700 md:text-xl">
          <strong className="font-semibold text-black">315 Fabrics</strong> is a fabric store
          based in Epe, Lagos, founded by{' '}
          <strong className="font-semibold text-black">Ayodeji Modinat Ayeola-Musari</strong>.
          With over 8 years in the fabric business, Ayodeji has built a reputation for sourcing
          the finest Ankara, French Lace, Swiss Voile, Aso-Oke, Senator material, and more —
          from markets in China, India, and across Nigeria.
        </p>
      </section>

      {/* Philosophy */}
      <section className="border-t border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-3xl px-6 py-20 md:px-12">
          <h2 className="mb-6 text-center text-2xl font-light uppercase tracking-widest">
            The Vision
          </h2>
          <p className="mb-4 text-sm leading-relaxed text-neutral-600">
            Every great outfit starts with great fabric. At 315 Fabrics, we believe that the
            right material — the right weight, the right weave, the right colour — transforms
            a garment from ordinary to unforgettable.
          </p>
          <p className="text-sm leading-relaxed text-neutral-600">
            Whether you&apos;re planning an asoebi for a wedding, looking for the perfect French
            Lace for a naming ceremony, or simply want quality Ankara for everyday wear, we
            source it carefully and offer it at honest prices. Based in Epe, we serve customers
            across Lagos and all over Nigeria.
          </p>
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
              title: '8+ Years of Experience',
              text: 'Ayodeji has spent over 8 years building supplier relationships across Lagos, China, and India — so every fabric that reaches you has been personally vetted for quality.',
            },
            {
              title: 'Asoebi Specialists',
              text: 'From intimate family celebrations to large-scale wedding asoebi orders, we understand what Nigerian families need and how to deliver it reliably.',
            },
            {
              title: 'Honest Pricing',
              text: 'We source directly and price fairly. No hidden markups — just quality fabric at prices that respect your budget and your time.',
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
        <h2 className="mb-6 text-2xl font-light uppercase tracking-widest">Shop Our Fabrics</h2>
        <p className="mx-auto mb-8 max-w-lg text-sm leading-relaxed text-neutral-400">
          Ankara, French Lace, Swiss Voile, Aso-Oke, Senator and more — available to order
          online or via WhatsApp.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/shop"
            className="inline-block border border-white px-10 py-4 text-sm uppercase tracking-widest transition-colors hover:bg-white hover:text-black"
          >
            Shop All Fabrics
          </Link>
          <a
            href="https://wa.me/2349066609177"
            target="_blank"
            rel="noreferrer"
            className="inline-block border border-white/30 px-10 py-4 text-sm uppercase tracking-widest text-white/60 transition-colors hover:border-white hover:text-white"
          >
            WhatsApp Us
          </a>
        </div>
      </section>
    </div>
  );
}
