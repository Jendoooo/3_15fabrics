import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { v2 as cloudinary } from 'cloudinary';

export const dynamic = 'force-dynamic';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
    try {
        // 1) Auth check
        const cookieStore = cookies();
        const adminSession = cookieStore.get('315fabrics_admin_session')?.value;

        if (!adminSession || adminSession !== process.env.ADMIN_SESSION_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2) Parse FormData
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // 3) Validate file type
        const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validMimeTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' }, { status: 400 });
        }

        // 4) Validate file size (5MB = 5 * 1024 * 1024 = 5242880 bytes)
        const MAX_FILE_SIZE = 5 * 1024 * 1024;
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: 'File size exceeds 5MB limit.' }, { status: 413 });
        }

        // 5) Convert File to Buffer for Cloudinary stream
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // 6) Upload to Cloudinary via stream
        const uploadResult = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: '315fabrics/products',
                },
                (error, result) => {
                    if (error || !result) {
                        reject(error || new Error('Upload failed with no result'));
                    } else {
                        resolve({
                            secure_url: result.secure_url,
                            public_id: result.public_id,
                        });
                    }
                }
            );

            uploadStream.end(buffer);
        });

        return NextResponse.json({
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
        });
    } catch (error) {
        console.error('Image upload error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
