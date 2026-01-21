import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// // export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const proposals = await prisma.policyProposal.findMany({
            include: {
                proposer: {
                    select: { name: true, id: true }
                },
                votes: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 20,
        });

        // Convert BigInt
        const serialized = proposals.map(p => ({
            ...p,
            deadline: Number(p.deadline),
            createdAt: p.createdAt.toISOString(),
            updatedAt: p.updatedAt.toISOString(),
        }));

        return NextResponse.json(serialized);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export const dynamic = 'force-static';

