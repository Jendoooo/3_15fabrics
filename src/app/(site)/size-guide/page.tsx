import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Size Guide — iby_closet',
  description: 'Find your perfect fit with our comprehensive size guide for all iby_closet garments.',
};

const topsSizes = [
  { size: 'S', chest: '36–38', waist: '30–32', length: '27', sleeve: '24' },
  { size: 'M', chest: '38–40', waist: '32–34', length: '28', sleeve: '25' },
  { size: 'L', chest: '40–42', waist: '34–36', length: '29', sleeve: '26' },
  { size: 'XL', chest: '42–44', waist: '36–38', length: '30', sleeve: '27' },
  { size: 'XXL', chest: '44–46', waist: '38–40', length: '31', sleeve: '28' },
];

const bottomsSizes = [
  { size: 'S / 30', waist: '30', hip: '38', inseam: '30', outseam: '40' },
  { size: 'M / 32', waist: '32', hip: '40', inseam: '30', outseam: '41' },
  { size: 'L / 34', waist: '34', hip: '42', inseam: '31', outseam: '42' },
  { size: 'XL / 36', waist: '36', hip: '44', inseam: '31', outseam: '43' },
  { size: 'XXL / 38', waist: '38', hip: '46', inseam: '32', outseam: '44' },
];

function SizeTable({
  title,
  headers,
  rows,
}: {
  title: string;
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="mb-12">
      <h2 className="mb-6 text-lg font-light uppercase tracking-widest">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-black">
              {headers.map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-neutral-200 transition-colors hover:bg-neutral-50"
              >
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className={`px-4 py-3 ${j === 0 ? 'font-medium' : 'text-neutral-600'}`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function SizeGuidePage() {
  return (
    <div>
      {/* Hero */}
      <section className="flex min-h-[30vh] items-center justify-center bg-black text-white">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h1 className="mb-4 text-4xl font-light uppercase tracking-[0.3em] md:text-5xl">
            Size Guide
          </h1>
          <p className="text-sm uppercase tracking-[0.25em] text-neutral-400">
            All measurements in inches
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16 md:px-12">
        {/* How to measure */}
        <div className="mb-16">
          <h2 className="mb-6 text-lg font-light uppercase tracking-widest">
            How to Measure
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[
              {
                title: 'Chest',
                desc: 'Measure around the fullest part of your chest, keeping the tape level under your arms. Don\'t pull the tape too tight — your shirt should fit, not squeeze.',
              },
              {
                title: 'Waist',
                desc: 'Measure around your natural waistline, usually right around your belly button. Keep it relaxed.',
              },
              {
                title: 'Hip',
                desc: 'Measure around the fullest part of your hips. Stand naturally and let the tape sit comfortably.',
              },
              {
                title: 'Inseam',
                desc: 'Measure from the crotch seam to the bottom of the leg along the inside. We recommend using a well-fitting pair of trousers you already own.',
              },
            ].map((tip) => (
              <div key={tip.title} className="border-l-2 border-black pl-4">
                <h3 className="mb-1 text-sm font-semibold uppercase tracking-widest">
                  {tip.title}
                </h3>
                <p className="text-sm leading-relaxed text-neutral-600">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tops */}
        <SizeTable
          title="Tops — T-Shirts, Shirts, Jackets"
          headers={['Size', 'Chest', 'Waist', 'Length', 'Sleeve']}
          rows={topsSizes.map((r) => [r.size, r.chest, r.waist, r.length, r.sleeve])}
        />

        {/* Bottoms */}
        <SizeTable
          title="Bottoms — Trousers, Shorts"
          headers={['Size', 'Waist', 'Hip', 'Inseam', 'Outseam']}
          rows={bottomsSizes.map((r) => [r.size, r.waist, r.hip, r.inseam, r.outseam])}
        />

        {/* Tips */}
        <div className="mt-8 border-t border-neutral-200 pt-8">
          <h2 className="mb-4 text-lg font-light uppercase tracking-widest">
            Fit Tips
          </h2>
          <ul className="space-y-3 text-sm leading-relaxed text-neutral-600">
            <li>
              <strong className="text-black">Between sizes?</strong> We recommend sizing up
              for a relaxed fit or down for a more tailored look.
            </li>
            <li>
              <strong className="text-black">First time buying?</strong> DM us on{' '}
              <a
                href="https://instagram.com/iby_closet"
                target="_blank"
                rel="noreferrer"
                className="underline transition-colors hover:text-black"
              >
                Instagram
              </a>{' '}
              or{' '}
              <a
                href="https://wa.me/"
                target="_blank"
                rel="noreferrer"
                className="underline transition-colors hover:text-black"
              >
                WhatsApp
              </a>{' '}
              with your height and weight — we&apos;ll recommend the perfect size.
            </li>
            <li>
              <strong className="text-black">Fabric matters.</strong> Some fabrics stretch
              more than others. Check individual product pages for fabric-specific fit
              notes.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
