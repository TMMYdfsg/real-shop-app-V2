import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Force dynamic rendering for file uploads
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

        // ファイルサイズチェック（100MB以下）
        const maxSize = 100 * 1024 * 1024; // 100MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'ファイルサイズが大きすぎます（最大100MB）' },
                { status: 400 }
            );
        }

        // ファイルタイプチェック
        const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'サポートされていないファイル形式です（MP4、WebM、MOVのみ）' },
                { status: 400 }
            );
        }

        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            return NextResponse.json(
                { error: 'Cloudinaryの設定が不足しています' },
                { status: 500 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploaded = await new Promise<{
            secure_url: string;
            public_id: string;
            bytes: number;
            resource_type: string;
            format?: string;
        }>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { resource_type: 'video', folder: 'real-shop/videos' },
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
        console.error('Video upload error:', error);
        return NextResponse.json(
            { error: 'アップロードに失敗しました' },
            { status: 500 }
        );
    }
}
