import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
    try {
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;

        if (!file) {
            return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Ensure upload directory exists
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'videos');
        await mkdir(uploadDir, { recursive: true });

        // Generate unique filename
        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filepath = join(uploadDir, filename);

        // Write file
        await writeFile(filepath, buffer);

        // Return public URL
        const publicUrl = `/uploads/videos/${filename}`;
        return NextResponse.json({ success: true, url: publicUrl });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ success: false, message: 'Upload failed' }, { status: 500 });
    }
}
