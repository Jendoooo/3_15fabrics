'use client';

import Image from 'next/image';
import { ChangeEvent, useEffect, useId, useState } from 'react';

type ImageUploaderProps = {
  onUpload: (url: string) => void;
  label?: string;
};

export default function ImageUploader({ onUpload, label = 'Upload Image' }: ImageUploaderProps) {
  const inputId = useId();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setFileName(file.name);

    const localPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl((previousPreviewUrl) => {
      if (previousPreviewUrl && previousPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previousPreviewUrl);
      }
      return localPreviewUrl;
    });

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      const payload = (await response.json().catch(() => null)) as
        | { url?: string; secure_url?: string; error?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? 'Upload failed.');
      }

      const uploadedUrl = payload?.secure_url ?? payload?.url;
      if (!uploadedUrl) {
        throw new Error('Upload succeeded but no image URL was returned.');
      }

      onUpload(uploadedUrl);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Failed to upload image.');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label
        htmlFor={inputId}
        className="flex cursor-pointer items-center justify-between gap-3 rounded border border-dashed border-neutral-300 px-3 py-2 transition-colors hover:border-black"
      >
        <span className="text-[11px] uppercase tracking-widest text-neutral-600">
          {isUploading ? 'Uploading...' : label}
        </span>
        <span className="truncate text-[10px] text-neutral-400">
          {fileName || 'JPEG, PNG, or WebP'}
        </span>
      </label>
      <input
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {previewUrl ? (
        <div className="overflow-hidden rounded border border-neutral-200 bg-neutral-50 p-2">
          <Image
            src={previewUrl}
            alt="Upload preview"
            width={96}
            height={120}
            unoptimized
            className="h-auto w-24 object-cover"
          />
        </div>
      ) : null}

      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
