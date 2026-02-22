'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function LookbookStrip() {
    const ref = useRef<HTMLDivElement>(null);

    return (
        <div className="relative px-6 md:px-12">
            <button
                onClick={() => ref.current?.scrollBy({ left: -340, behavior: 'smooth' })}
                className="hidden md:flex absolute items-center justify-center w-10 h-10 rounded-full bg-black/60 text-white hover:bg-black transition-colors z-10 left-2 top-1/2 -translate-y-1/2"
                type="button"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>
            <button
                onClick={() => ref.current?.scrollBy({ left: 340, behavior: 'smooth' })}
                className="hidden md:flex absolute items-center justify-center w-10 h-10 rounded-full bg-black/60 text-white hover:bg-black transition-colors z-10 right-2 top-1/2 -translate-y-1/2"
                type="button"
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            <div ref={ref} className="flex overflow-x-auto scrollbar-hide gap-3">
                {[
                    '/images/instagram/post_8.jpg',
                    '/images/instagram/post_10.jpg',
                    '/images/instagram/post_12.jpg',
                    '/images/instagram/post_14.jpg',
                    '/images/instagram/post_18.jpg',
                ].map((src, i) => (
                    <Link
                        key={i}
                        href="/lookbook"
                        className="relative flex-none w-[260px] md:w-[320px] aspect-[3/4] overflow-hidden bg-neutral-100 group"
                    >
                        <Image
                            src={src}
                            alt="Lookbook teaser"
                            fill
                            sizes="320px"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    </Link>
                ))}
            </div>
        </div>
    );
}
