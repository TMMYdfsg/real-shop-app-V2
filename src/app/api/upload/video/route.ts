import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

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

        // ファイルサイズチェック（200MB以下 - 10分程度の動画に対応）
        const maxSize = 200 * 1024 * 1024; // 200MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'ファイルサイズが大きすぎます（最大200MB）' },
                { status: 400 }
            );
        }

        // ファイルタイプチェック
        const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
        if (!allowedTypes.includes(file.type)) {
            console.log('Rejected file type:', file.type, 'File name:', file.name);
            return NextResponse.json(
                { error: `サポートされていないファイル形式です（MP4、WebM、MOVのみ）。検出された形式: ${file.type || '不明'}` },
                { status: 400 }
            );
        }

        // アップロードディレクトリを作成 (root/uploads/videos)
        // publicディレクトリ以外に保存することで、Next.jsの開発サーバーの監視対象から外し、ブラウザのリロードを防ぐ
        const uploadDir = path.join(process.cwd(), 'uploads', 'videos');
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        // ユニークなファイル名を生成
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        const ext = file.name.split('.').pop() || 'mp4';
        const filename = `video_${timestamp}_${random}.${ext}`;
        const filepath = path.join(uploadDir, filename);

        // ファイルを保存
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);

        // 公開URLを返す (Serving API経由)
        const url = `/api/video/serve/${filename}`;

        return NextResponse.json({
            success: true,
            url: url,
            filename: filename,
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
