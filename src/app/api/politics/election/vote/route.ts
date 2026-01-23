import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { electionId, candidateId } = body || {};
        if (!electionId || !candidateId) {
            return NextResponse.json({ error: 'Invalid params' }, { status: 400 });
        }

        const cookieStore = await cookies();
        const userId = cookieStore.get('userId')?.value;
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const election = await prisma.bankerElection.findUnique({ where: { id: electionId } });
        if (!election || election.status !== 'active') {
            return NextResponse.json({ error: 'Election not active' }, { status: 400 });
        }

        const votes = (election.votes as Record<string, string>) || {};
        if (votes[userId]) {
            return NextResponse.json({ error: 'Already voted' }, { status: 400 });
        }

        const candidates = (election.candidates as { id: string }[]) || [];
        if (!candidates.find((c) => c.id === candidateId)) {
            return NextResponse.json({ error: 'Invalid candidate' }, { status: 400 });
        }

        votes[userId] = candidateId;

        const updated = await prisma.bankerElection.update({
            where: { id: electionId },
            data: { votes }
        });

        return NextResponse.json({
            ...updated,
            startedAt: updated.startedAt.toISOString(),
            endsAt: updated.endsAt.toISOString(),
            createdAt: updated.createdAt.toISOString(),
            updatedAt: updated.updatedAt.toISOString()
        });
    } catch (error) {
        console.error('Election Vote Error:', error);
        return NextResponse.json({ error: 'Failed to vote' }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic';
