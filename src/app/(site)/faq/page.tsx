import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'FAQ — iby_closet',
  description: 'Frequently asked questions about orders, shipping, sizing, returns, and payments at iby_closet.',
};

const faqs = [
  {
    category: 'Orders & Shipping',
    items: [
      {
        q: 'How long does delivery take?',
        a: 'Within Lagos: 2–5 days via GIG Logistics or dispatch rider. Outside Lagos: 5–10 days. International orders: 10–21 days depending on destination.',
      },
      {
        q: 'How much is delivery?',
        a: 'Delivery fees are calculated at checkout based on your location. We optimize for the most reliable delivery standard.',
      },
      {
        q: 'Can I track my order?',
        a: 'Yes! Use your order number (format: IBY-XXXXXXXX) on our Track Order page. No account needed — just enter your order number.',
      },
      {
        q: 'Do you ship internationally?',
        a: 'Yes, we ship to select countries. International shipping options and fees are calculated at checkout based on your delivery address.',
      },
      {
        q: 'Can I pick up my order in Lagos?',
        a: 'Yes. We have a physical space in Lagos for walk-in pickups. Choose "Pick Up" at checkout or DM us for the address and available times.',
      },
    ],
  },
  {
    category: 'Sizing & Fit',
    items: [
      {
        q: 'How do I find my size?',
        a: 'Check our Size Guide for detailed measurements. If you\'re between sizes, we recommend sizing up for a relaxed fit. You can also DM us on Instagram or WhatsApp with your height and weight for a personalized recommendation.',
      },
      {
        q: 'Do your clothes run true to size?',
        a: 'Our pieces generally run true to size. Some collections may have a more relaxed or tailored cut — check individual product pages for specific fit notes.',
      },
    ],
  },
  {
    category: 'Payments',
    items: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept secure online payments via Paystack (card/transfer). For our physical space, we accept direct bank transfer and cash/POS at walk-in.',
      },
      {
        q: 'Is online payment secure?',
        a: 'Absolutely. All online payments are processed by Paystack, which is PCI DSS compliant. We never see or store your card details.',
      },
    ],
  },
  {
    category: 'Returns & Exchanges',
    items: [
      {
        q: 'What is your return policy?',
        a: 'We offer exchanges only within 7 days of delivery. Items must be unworn with tags attached. We do not offer refunds.',
      },
    ],
  },
  {
    category: 'General',
    items: [
      {
        q: 'Do you restock sold-out items?',
        a: 'Some items from past collections may be restocked, but we primarily release limited drops. Use the "Notify Me" button on sold-out products to be alerted if they return.',
      },
      {
        q: 'Can I order through Instagram or WhatsApp?',
        a: 'Yes! DM us on Instagram (@iby_closet) or message us directly on WhatsApp at +234 913 141 0602. Just tell us what you want, your size, and your delivery location — we\'ll send a payment link and handle everything from there.',
      },
      {
        q: 'Do you do custom or made-to-order pieces?',
        a: 'Currently we focus on our collection drops. However, reach out via WhatsApp (+234 913 141 0602) and we can discuss possibilities.',
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div>
      {/* Hero */}
      <section className="flex min-h-[30vh] items-center justify-center bg-black text-white">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h1 className="mb-4 text-4xl font-light uppercase tracking-[0.3em] md:text-5xl">
            FAQ
          </h1>
          <p className="text-sm uppercase tracking-[0.25em] text-neutral-400">
            Frequently Asked Questions
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16 md:px-12">
        {faqs.map((section) => (
          <div key={section.category} className="mb-12">
            <h2 className="mb-6 text-lg font-light uppercase tracking-widest">
              {section.category}
            </h2>
            <div className="space-y-6">
              {section.items.map((faq) => (
                <details
                  key={faq.q}
                  className="group border-b border-neutral-200 pb-6"
                >
                  <summary className="flex cursor-pointer items-center justify-between text-sm font-medium leading-relaxed">
                    {faq.q}
                    <span className="ml-4 flex-shrink-0 text-lg text-neutral-400 transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        ))}

        {/* Still have questions */}
        <div className="mt-16 border-t border-neutral-200 pt-12 text-center">
          <h2 className="mb-4 text-lg font-light uppercase tracking-widest">
            Still Have Questions?
          </h2>
          <p className="mb-6 text-sm text-neutral-600">
            We&apos;re always happy to help. Reach out through any of these channels.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="border border-black px-8 py-3 text-sm uppercase tracking-widest transition-colors hover:bg-black hover:text-white"
            >
              Contact Us
            </Link>
            <a
              href="https://wa.me/2349131410602"
              target="_blank"
              rel="noreferrer"
              className="bg-black px-8 py-3 text-sm uppercase tracking-widest text-white transition-colors hover:bg-neutral-800"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
