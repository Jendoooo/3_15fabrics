'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductImageProps {
    images: {
        id: string;
        image_url: string;
        alt_text: string | null;
    }[];
    productName: string;
}

export default function ProductImageGallery({ images, productName }: ProductImageProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectedImage = images[selectedIndex];

    return (
        <div>
            <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-neutral-900">
                {images.length > 0 && selectedImage ? (
                    <Image
                        src={selectedImage.image_url}
                        alt={selectedImage.alt_text ?? productName}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition-opacity duration-300"
                    />
                ) : (
                    <span className="px-6 text-center text-sm font-light uppercase tracking-widest text-white">
                        {productName}
                    </span>
                )}
            </div>

            {images.length > 1 && (
                <div className="mt-4 grid grid-cols-4 gap-2">
                    {images.map((img, i) => (
                        <button
                            key={img.id}
                            onClick={() => setSelectedIndex(i)}
                            className={`relative aspect-[4/5] overflow-hidden bg-neutral-100 transition-opacity ${selectedIndex === i ? 'ring-2 ring-black ring-offset-1' : 'opacity-60 hover:opacity-100'
                                }`}
                            type="button"
                        >
                            <Image
                                src={img.image_url}
                                alt={img.alt_text ?? `${productName} secondary view`}
                                fill
                                sizes="25vw"
                                className="object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
