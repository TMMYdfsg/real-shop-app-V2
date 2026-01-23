import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { NPCS as MASTER_NPCS } from '@/lib/gameData';

function getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function POST() {
    try {
        const election = await prisma.bankerElection.findFirst({
            where: { status: 'active' },
            orderBy: { createdAt: 'desc' }
        });

        if (!election) {
            return NextResponse.json({ ok: true, message: 'No active election' });
        }

        if (new Date() < election.endsAt) {
            return NextResponse.json({ ok: true, message: 'Election still active' });
        }

        const candidates = (election.candidates as { id: string; name: string }[]) || [];
        const votes = (election.votes as Record<string, string>) || {};
        const npcCount = getRandomInt(30, 120);
        const npcNames = Object.keys(MASTER_NPCS);
        const npcVotes = Array.from({ length: npcCount }).map((_, index) => {
            const name = npcNames[index % npcNames.length] || `市民${index + 1}`;
            const candidate = candidates[getRandomInt(0, Math.max(candidates.length - 1, 0))];
            return { name, candidateId: candidate?.id || '' };
        });

        const tally: Record<string, number> = {};
        for (const candidate of candidates) {
            tally[candidate.id] = 0;
        }
        Object.values(votes).forEach((candidateId) => {
            if (tally[candidateId] !== undefined) tally[candidateId] += 1;
        });
        npcVotes.forEach((vote) => {
            if (tally[vote.candidateId] !== undefined) tally[vote.candidateId] += 1;
        });

        const winnerId = Object.entries(tally).sort((a, b) => b[1] - a[1])[0]?.[0];

        const candidateUsers = await prisma.user.findMany({
            where: { id: { in: candidates.map((c) => c.id) } },
            select: { id: true, popularity: true, rating: true, happiness: true, balance: true, name: true }
        });

        const rewardLog: Record<string, number> = {};
        for (const user of candidateUsers) {
            const achievementScore = Math.max(0, Math.round(
                user.popularity * 5 +
                user.rating * 100 +
                user.happiness * 2 +
                Math.min(user.balance / 1000, 1000)
            ));
            rewardLog[user.id] = achievementScore;
        }

        await prisma.$transaction(async (tx) => {
            await tx.bankerElection.update({
                where: { id: election.id },
                data: {
                    status: 'finished',
                    winnerId,
                    npcVotes,
                    rewardLog
                }
            });

            if (winnerId) {
                await tx.user.updateMany({
                    where: { role: 'banker' },
                    data: { role: 'player' }
                });
                await tx.user.update({
                    where: { id: winnerId },
                    data: { role: 'banker' }
                });
            }

            for (const [userId, amount] of Object.entries(rewardLog)) {
                if (amount <= 0) continue;
                await tx.user.update({
                    where: { id: userId },
                    data: { balance: { increment: amount } }
                });
                await tx.transaction.create({
                    data: {
                        id: crypto.randomUUID(),
                        type: 'income',
                        amount,
                        receiverId: userId,
                        description: '総選挙の功績報酬',
                        timestamp: BigInt(Date.now())
                    }
                });
            }
        });

        return NextResponse.json({ ok: true, winnerId, npcCount, rewardLog });
    } catch (error) {
        console.error('Election Resolve Error:', error);
        return NextResponse.json({ error: 'Failed to resolve election' }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic';
