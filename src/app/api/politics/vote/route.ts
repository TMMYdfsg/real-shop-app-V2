import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { proposalId, vote } = body; // vote: 'yes' | 'no'

        const cookieStore = await cookies();
        const userIdCookie = cookieStore.get('userId');
        let userId = userIdCookie?.value;

        if (!userId) {
            // Fallback for dev
            const user = await prisma.user.findFirst({ where: { role: 'player' } });
            userId = user?.id;
        }

        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Check if already voted
        const existing = await prisma.vote.findUnique({
            where: {
                proposalId_userId: {
                    proposalId,
                    userId
                }
            }
        });

        if (existing) {
            return NextResponse.json({ error: 'Already voted' }, { status: 400 });
        }

        // Create Vote
        await prisma.vote.create({
            data: {
                proposalId,
                userId,
                vote
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Vote Error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export const dynamic = 'force-static';

