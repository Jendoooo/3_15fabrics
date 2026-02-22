import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about orders, shipping, sizing, returns, and payments at 315 Fabrics.',
};

const faqs = [
  {
    category: 'Ordering & Yards',
    items: [
      {
        q: 'How do I know how many yards I need?',
        a: 'Check our [Yardage Guide](/yardage-guide) for a breakdown by outfit type. When in doubt, add an extra half yard.',
      },
      {
        q: 'What is the minimum order?',
        a: 'Each product listing shows the minimum. Most fabrics start at 5 yards.',
      },
      {
        q: 'Can I order a custom amount of yards?',
        a: 'Yes, for yard-type products you choose how many yards you need (subject to stock).',
      },
      {
        q: 'What does \'bundle\' mean?',
        a: 'A bundle is a fixed set of yards sold as one complete unit — perfect for a single outfit.',
      },
    ],
  },
  {
    category: 'Fabric Types',
    items: [
      {
        q: 'What types of fabric do you sell?',
        a: 'We carry Ankara, French Lace, Swiss Voile, Aso-Oke, Senator, and Cotton. New arrivals drop regularly.',
      },
      {
        q: 'Do you do asoebi group orders?',
        a: 'Yes! WhatsApp us at +234 906 660 9177 for bulk pricing for events and wedding groups.',
      },
    ],
  },
  {
    category: 'Payment',
    items: [
      {
        q: 'How do I pay?',
        a: 'Online via card or bank transfer through Paystack (secure). You can also place orders via WhatsApp and pay by bank transfer.',
      },
      {
        q: 'Is payment secure?',
        a: 'Yes — all online payments are processed by Paystack, a trusted Nigerian payment gateway.',
      },
    ],
  },
  {
    category: 'Delivery',
    items: [
      {
        q: 'Do you deliver nationwide?',
        a: 'Yes, we deliver across Nigeria.',
      },
      {
        q: 'How long does delivery take?',
        a: 'Lagos: 2–5 working days. Outside Lagos: 3–7 working days.',
      },
      {
        q: 'How much is delivery?',
        a: 'Delivery fee is calculated at checkout based on your location.',
      },
    ],
  },
  {
    category: 'Returns & Quality',
    items: [
      {
        q: 'What if my fabric is faulty?',
        a: 'Contact us within 48 hours of receiving your order. WhatsApp +234 906 660 9177 with photos and your order number.',
      },
      {
        q: 'Are your fabrics authentic?',
        a: 'Yes — all fabrics are sourced directly from trusted suppliers. We don\'t sell substandard goods.',
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
