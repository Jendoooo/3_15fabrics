'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface ProductCardProps {
    slug: string;
    name: string;
    price: number;
    imageUrl: string | null;
}

export default function ProductCard({ slug, name, price, imageUrl }: ProductCardProps) {
    return (
        <Link href={`/products/${slug}`} className="group block">
            <motion.div whileHover={{ y: -4 }}>
                <div className="relative aspect-[4/5] overflow-hidden mb-4 rounded-md bg-brand-cream">
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 50vw, 25vw"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-brand-cream">
                            <span className="px-4 text-center text-xs uppercase tracking-widest text-brand-earth">
                                No Image
                            </span>
                        </div>
                    )}
                </div>
                <h3 className="text-sm uppercase tracking-widest text-neutral-900 group-hover:text-neutral-500 transition-colors">
                    {name}
                </h3>
                <p className="text-neutral-500 mt-1 text-sm bg-neutral-50 w-fit px-2 py-0.5 rounded border shadow-sm">
                    &#8358;{price.toLocaleString('en-NG')}
                </p>
            </motion.div>
        </Link>
    );
}
