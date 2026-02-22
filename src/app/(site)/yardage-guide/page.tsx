import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Yardage Guide',
  description:
    'Not sure how many yards you need? Use this guide for common Nigerian outfit styles.',
};

const yardageRows = [
  { style: 'Buba + Iro (traditional)', yards: '6-8 yards' },
  { style: 'Gown (fitted/midi)', yards: '4-5 yards' },
  { style: 'Gown (maxi/flared)', yards: '5-7 yards' },
  { style: 'Agbada (3-piece set)', yards: '12-15 yards' },
  { style: "Kaftan (men's)", yards: '4-5 yards' },
  { style: "Men's shirt", yards: '2.5-3 yards' },
  { style: 'Trousers', yards: '2-2.5 yards' },
  { style: 'Aso-Oke wrapper (per piece)', yards: '2 yards' },
  { style: 'Asoebi group order', yards: 'Contact us for bulk pricing' },
];

export default function YardageGuidePage() {
  return (
    <div>
      <section className="flex min-h-[30vh] items-center justify-center bg-black text-white">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h1 className="mb-4 text-4xl font-light uppercase tracking-[0.3em] md:text-5xl">
            Yardage Guide
          </h1>
          <p className="text-sm uppercase tracking-[0.25em] text-neutral-400">
            How many yards do you need?
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl bg-white px-6 py-20 md:px-12">
        <p className="mb-10 text-sm leading-relaxed text-neutral-700">
          Not sure how many yards you need? Here&apos;s a quick guide for common Nigerian styles.
        </p>

        <div className="overflow-x-auto border border-neutral-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-neutral-50">
                <th className="border-b border-neutral-200 px-4 py-3 font-medium uppercase tracking-widest text-neutral-600">
                  Style
                </th>
                <th className="border-b border-neutral-200 px-4 py-3 font-medium uppercase tracking-widest text-neutral-600">
                  Yards Needed
                </th>
              </tr>
            </thead>
            <tbody>
              {yardageRows.map((row, index) => (
                <tr key={row.style} className={index % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'}>
                  <td className="border-b border-neutral-100 px-4 py-3 align-top">{row.style}</td>
                  <td className="border-b border-neutral-100 px-4 py-3 align-top">{row.yards}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-12">
          <h2 className="mb-4 text-lg font-light uppercase tracking-widest">Tips for Ordering</h2>
          <ul className="space-y-3 text-sm leading-relaxed text-neutral-700">
            <li>
              When in doubt, buy an extra half yard - it&apos;s better to have extra than to run
              short.
            </li>
            <li>
              For group asoebi orders, measure per outfit style and multiply by number of guests.
            </li>
            <li>
              Not sure? WhatsApp us at +234 906 660 9177 and we&apos;ll help you work it out.
            </li>
          </ul>
        </div>

        <div className="mt-12 border-t border-neutral-200 pt-8">
          <Link href="/shop" className="text-sm uppercase tracking-widest text-neutral-700 hover:text-black">
            &larr; Back to Shop
          </Link>
        </div>
      </section>
    </div>
  );
}
