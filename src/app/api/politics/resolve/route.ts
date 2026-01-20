import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        const now = BigInt(Date.now());

        // Find active proposals that have expired
        const expiredProposals = await prisma.policyProposal.findMany({
            where: {
                status: 'active',
                deadline: {
                    lt: now
                }
            },
            include: {
                votes: true
            }
        });

        if (expiredProposals.length === 0) {
            return NextResponse.json({ processed: 0 });
        }

        const results = [];

        for (const proposal of expiredProposals) {
            const yesVotes = proposal.votes.filter((v: any) => v.vote === 'yes').length;
            const noVotes = proposal.votes.filter((v: any) => v.vote === 'no').length;

            const passed = yesVotes > noVotes;
            const newStatus = passed ? 'passed' : 'rejected';

            // Update Proposal Status
            await prisma.policyProposal.update({
                where: { id: proposal.id },
                data: { status: newStatus }
            });

            // Apply Effects if passed
            if (passed) {
                if (proposal.type === 'tax_change' && proposal.params) {
                    const params = proposal.params as any;
                    if (params.target === 'taxRate' && typeof params.value === 'number') {
                        await prisma.gameSettings.update({
                            where: { id: 'singleton' },
                            data: { taxRate: params.value }
                        });
                    }
                } else if (proposal.type === 'grant' && proposal.params) {
                    const params = proposal.params as any;
                    if (params.amount) {
                        await prisma.user.updateMany({
                            where: { role: 'player' },
                            data: { balance: { increment: params.amount } }
                        });
                    }
                }

                // Broadcast News
                await prisma.news.create({
                    data: {
                        id: uuidv4(),
                        message: `📜 法案可決: 「${proposal.title}」が施行されました！`,
                        timestamp: now
                    }
                });
            } else {
                await prisma.news.create({
                    data: {
                        id: uuidv4(),
                        message: `❌ 法案否決: 「${proposal.title}」は廃案となりました。`,
                        timestamp: now
                    }
                });
            }

            results.push({ id: proposal.id, status: newStatus });
        }

        return NextResponse.json({ processed: results.length, results });
    } catch (error) {
        console.error('Resolution Error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
