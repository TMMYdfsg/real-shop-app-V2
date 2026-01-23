import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const election = await prisma.bankerElection.findFirst({
            orderBy: { createdAt: 'desc' }
        });
        if (!election) return NextResponse.json(null);
        return NextResponse.json({
            ...election,
            startedAt: election.startedAt.toISOString(),
            endsAt: election.endsAt.toISOString(),
            createdAt: election.createdAt.toISOString(),
            updatedAt: election.updatedAt.toISOString()
        });
    } catch (error) {
        console.error('Election GET Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST() {
    try {
        const active = await prisma.bankerElection.findFirst({
            where: { status: 'active' },
            orderBy: { createdAt: 'desc' }
        });
        if (active) {
            return NextResponse.json({
                error: 'Election already active',
                electionId: active.id
            }, { status: 400 });
        }

        const candidates = await prisma.user.findMany({
            where: { role: { in: ['player', 'banker'] } },
            select: { id: true, name: true, popularity: true, rating: true }
        });

        const endsAt = new Date(Date.now() + 3 * 60 * 1000);
        const election = await prisma.bankerElection.create({
            data: {
                status: 'active',
                endsAt,
                candidates: candidates.map((c) => ({
                    id: c.id,
                    name: c.name,
                    popularity: c.popularity,
                    rating: c.rating
                })),
                votes: {},
                npcVotes: []
            }
        });

        return NextResponse.json({
            ...election,
            startedAt: election.startedAt.toISOString(),
            endsAt: election.endsAt.toISOString(),
            createdAt: election.createdAt.toISOString(),
            updatedAt: election.updatedAt.toISOString()
        });
    } catch (error) {
        console.error('Election Start Error:', error);
        return NextResponse.json({ error: 'Failed to start election' }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic';
