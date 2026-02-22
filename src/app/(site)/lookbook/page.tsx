import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Lookbook — iby_closet',
  description:
    'Editorial imagery from iby_closet collections. Campaign shoots &amp; product photography.',
};

const EDITORIAL = [
  { src: '/images/instagram/post_0.jpg', label: 'Campaign' },
  { src: '/images/instagram/post_1.jpg', label: 'Editorial' },
  { src: '/images/instagram/post_4.jpg', label: 'Lifestyle' },
  { src: '/images/instagram/post_5.jpg', label: 'Campaign' },
  { src: '/images/instagram/post_7.jpg', label: 'Editorial' },
  { src: '/images/instagram/post_8.jpg', label: 'Lifestyle' },
  { src: '/images/instagram/post_10.jpg', label: 'Campaign' },
  { src: '/images/instagram/post_12.jpg', label: 'Editorial' },
  { src: '/images/instagram/post_14.jpg', label: 'Lifestyle' },
  { src: '/images/instagram/post_16.jpg', label: 'Campaign' },
  { src: '/images/instagram/post_18.jpg', label: 'Editorial' },
  { src: '/images/instagram/post_19.jpg', label: 'Lifestyle' },
  { src: '/images/instagram/post_20.jpg', label: 'Campaign' },
  { src: '/images/instagram/post_22.jpg', label: 'Editorial' },
  { src: '/images/instagram/post_24.jpg', label: 'Lifestyle' },
];

const PRODUCTS = [
  '/images/instagram/product_100.jpg',
  '/images/instagram/product_101.jpg',
  '/images/instagram/product_102.jpg',
  '/images/instagram/product_103.jpg',
  '/images/instagram/product_104.jpg',
  '/images/instagram/product_105.jpg',
  '/images/instagram/product_106.jpg',
  '/images/instagram/product_107.jpg',
  '/images/instagram/product_114.jpg',
  '/images/instagram/product_117.jpg',
  '/images/instagram/product_119.jpg',
  '/images/instagram/product_121.jpg',
  '/images/instagram/product_122.jpg',
  '/images/instagram/product_123.jpg',
  '/images/instagram/product_124.jpg',
  '/images/instagram/product_125.jpg',
  '/images/instagram/product_126.jpg',
  '/images/instagram/product_127.jpg',
  '/images/instagram/product_128.jpg',
  '/images/instagram/product_129.jpg',
  '/images/instagram/product_130.jpg',
  '/images/instagram/product_132.jpg',
  '/images/instagram/product_133.jpg',
];

export default function LookbookPage() {
  return (
    <main className="bg-black text-white">
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-black">
        <Image
          src="/images/instagram/post_19.jpg"
          alt="iby_closet lookbook hero"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-40"
        />
        <div className="relative z-10 text-center">
          <h1 className="text-5xl font-light uppercase tracking-[0.3em] text-white md:text-7xl">
            Lookbook
          </h1>
          <p className="mt-4 text-xs uppercase tracking-[0.3em] text-neutral-400">
            Campaign imagery &amp; editorial moments
          </p>
        </div>
      </section>

      <div className="px-6 py-10 md:px-12">
        <h2 className="border-b border-neutral-800 pb-4 text-xs uppercase tracking-[0.4em] text-neutral-500">
          Campaign &amp; Editorial
        </h2>
      </div>

      <section className="px-4 pb-8 md:px-8">
        <div className="columns-1 gap-3 sm:columns-2 lg:columns-3">
          {EDITORIAL.map((img, i) => (
            <div key={i} className="group relative mb-3 break-inside-avoid overflow-hidden">
              <Image
                src={img.src}
                alt={img.label}
                width={600}
                height={800}
                className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="p-4 text-xs uppercase tracking-widest text-white">{img.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="px-6 py-10 md:px-12">
        <h2 className="border-b border-neutral-800 pb-4 text-xs uppercase tracking-[0.4em] text-neutral-500">
          Product Photography
        </h2>
      </div>

      <section className="px-4 pb-12 md:px-8">
        <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
          {PRODUCTS.map((src, i) => (
            <div key={i} className="group relative mb-3 break-inside-avoid overflow-hidden">
              <Image
                src={src}
                alt={`iby_closet product photo ${i + 1}`}
                width={400}
                height={500}
                className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-neutral-800 py-16 text-center">
        <a
          href="https://instagram.com/iby_closet"
          target="_blank"
          rel="noreferrer"
          className="inline-block border border-white px-8 py-3 text-sm uppercase tracking-widest text-white hover:bg-white hover:text-black transition-colors"
        >
          @iby_closet
        </a>
      </section>
    </main>
  );
}
