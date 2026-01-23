import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: { filename: string } }
) {
    try {
        const filename = params.filename;
        const filepath = path.join(process.cwd(), 'uploads', 'videos', filename);

        if (!existsSync(filepath)) {
            return new NextResponse('Video not found', { status: 404 });
        }

        const fileBuffer = await readFile(filepath);

        // Determine content type based on extension
        const ext = filename.split('.').pop()?.toLowerCase();
        let contentType = 'video/mp4';
        if (ext === 'webm') contentType = 'video/webm';
        if (ext === 'mov') contentType = 'video/quicktime';

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Content-Length': fileBuffer.length.toString(),
            },
        });
    } catch (error) {
        console.error('Video serving error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
