import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export const dynamic = 'force-dynamic';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'ファイルが選択されていません' },
                { status: 400 }
            );
        }

        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            return NextResponse.json(
                { error: 'Cloudinaryの設定が不足しています' },
                { status: 500 }
            );
        }

        const maxSize = 2 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: '画像サイズは2MB以下にしてください' },
                { status: 400 }
            );
        }

        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { error: '画像ファイルのみアップロードできます' },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploaded = await new Promise<{
            secure_url: string;
            public_id: string;
            bytes: number;
        }>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { resource_type: 'image', folder: 'real-shop/icons' },
                (error, result) => {
                    if (error || !result) {
                        reject(error ?? new Error('Upload failed'));
                        return;
                    }
                    resolve(result);
                }
            );
            stream.end(buffer);
        });

        return NextResponse.json({
            success: true,
            url: uploaded.secure_url,
            filename: uploaded.public_id,
            size: uploaded.bytes,
            type: file.type
        });
    } catch (error) {
        console.error('Icon upload error:', error);
        return NextResponse.json(
            { error: 'アップロードに失敗しました' },
            { status: 500 }
        );
    }
}
