import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Force dynamic rendering for file uploads
export const dynamic = 'force-dynamic';

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

        // アップロードディレクトリの確認・作成
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'videos');
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        // ファイル名の生成（タイムスタンプ + ランダム文字列）
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const extension = file.name.split('.').pop() || 'mp4';
        const safeExtension = extension.replace(/[^a-zA-Z0-9]/g, '');
        const filename = `video_${timestamp}_${randomString}.${safeExtension}`;
        const filepath = join(uploadDir, filename);

        // ファイルの保存
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);

        // 公開URLを返す
        const url = `/uploads/videos/${filename}`;

        return NextResponse.json({
            success: true,
            url,
            filename,
            size: file.size,
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
