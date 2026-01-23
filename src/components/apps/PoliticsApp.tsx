'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/context/GameContext';

interface Proposal {
    id: string;
    title: string;
    description: string;
    type: string;
    params?: any;
    proposer: { name: string };
    status: 'active' | 'passed' | 'rejected' | 'expired';
    deadline: number;
    votes: { userId: string; vote: 'yes' | 'no' }[];
}

interface BankerElection {
    id: string;
    status: 'active' | 'finished';
    startedAt: string;
    endsAt: string;
    candidates: { id: string; name: string }[];
    votes?: Record<string, string>;
    npcVotes?: { name: string; candidateId: string }[];
    winnerId?: string | null;
}

export default function PoliticsApp({ onClose }: { onClose: () => void }) {
    const { currentUser } = useGame();
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [election, setElection] = useState<BankerElection | null>(null);
    const [electionLoading, setElectionLoading] = useState(true);

    // Fetch Proposals
    const fetchProposals = async () => {
        try {
            // Trigger resolution of expired proposals concurrently
            fetch('/api/politics/resolve', { method: 'POST' }).catch(() => { });

            const res = await fetch('/api/politics');
            if (res.ok) {
                const data = await res.json();
                setProposals(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchElection = async () => {
        try {
            fetch('/api/politics/election/resolve', { method: 'POST' }).catch(() => { });
            const res = await fetch('/api/politics/election');
            if (res.ok) {
                const data = await res.json();
                setElection(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setElectionLoading(false);
        }
    };

    useEffect(() => {
        fetchProposals();
        fetchElection();
        const interval = setInterval(() => {
            fetchProposals();
            fetchElection();
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Vote Handler
    const handleVote = async (proposalId: string, vote: 'yes' | 'no') => {
        if (!currentUser) return;
        try {
            const res = await fetch('/api/politics/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ proposalId, vote }),
            });
            if (res.ok) {
                fetchProposals(); // Refresh immediately
                // Simple animation feedback could go here
            } else {
                alert('投票に失敗しました');
            }
        } catch (e) {
            alert('エラーが発生しました');
        }
    };

    const handleStartElection = async () => {
        if (!currentUser) return;
        try {
            const res = await fetch('/api/politics/election', { method: 'POST' });
            if (res.ok) {
                fetchElection();
            } else {
                const data = await res.json().catch(() => ({}));
                alert(data?.error || '選挙を開始できませんでした');
            }
        } catch (e) {
            alert('エラーが発生しました');
        }
    };

    const handleElectionVote = async (candidateId: string) => {
        if (!currentUser || !election) return;
        try {
            const res = await fetch('/api/politics/election/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ electionId: election.id, candidateId })
            });
            if (res.ok) {
                fetchElection();
            } else {
                const data = await res.json().catch(() => ({}));
                alert(data?.error || '投票に失敗しました');
            }
        } catch (e) {
            alert('エラーが発生しました');
        }
    };

    return (
        <div className="h-full bg-slate-50 flex flex-col font-sans relative">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4 shadow-lg flex items-center justify-between z-10">
                <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition">⬅</button>
                <h2 className="font-bold text-lg tracking-wide">🗳️ みんなの政治</h2>
                <div className="w-8" />
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">

                {/* Hero Section */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 text-center">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">街のルールを決めよう</h3>
                    <p className="text-slate-500 text-sm mb-4">
                        みんなの投票で税金やイベントが決まります。<br />
                        未来はこの手の中に！
                    </p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transform transition active:scale-95 flex items-center gap-2 mx-auto"
                    >
                        📝 新しいルールを提案する
                    </button>
                </div>

                {/* Banker Election */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-slate-800">🏦 次期銀行員 総選挙</h3>
                        {election?.status === 'active' && (
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                受付中
                            </span>
                        )}
                        {election?.status === 'finished' && (
                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                終了
                            </span>
                        )}
                    </div>
                    {electionLoading ? (
                        <div className="text-sm text-slate-400">読み込み中...</div>
                    ) : (
                        <>
                            {!election && (
                                <div className="text-center text-sm text-slate-500">
                                    まだ総選挙は開催されていません。
                                </div>
                            )}
                            {election?.status === 'active' && (
                                <>
                                    <div className="text-xs text-slate-500 mb-3">
                                        締切: {new Date(election.endsAt).toLocaleTimeString()}
                                    </div>
                                    <div className="space-y-2">
                                        {election.candidates.map((candidate) => {
                                            const myVote = election.votes?.[currentUser?.id || ''];
                                            return (
                                                <button
                                                    key={candidate.id}
                                                    onClick={() => handleElectionVote(candidate.id)}
                                                    disabled={!!myVote}
                                                    className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-bold transition ${myVote === candidate.id
                                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                                        : myVote
                                                            ? 'border-slate-200 text-slate-400 bg-slate-50'
                                                            : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700'
                                                        }`}
                                                >
                                                    <span>{candidate.name}</span>
                                                    <span className="text-xs text-slate-400">
                                                        {myVote === candidate.id ? '投票済み' : '投票'}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-3">
                                        一般人NPCもランダム投票します。
                                    </div>
                                </>
                            )}
                            {election?.status === 'finished' && (
                                <div className="text-sm text-slate-600 space-y-2">
                                    <div>当選: {election.candidates.find(c => c.id === election.winnerId)?.name || '不明'}</div>
                                    <div>一般人NPC投票数: {election.npcVotes?.length || 0}票</div>
                                </div>
                            )}
                            {(!election || election.status === 'finished') && (
                                <button
                                    onClick={handleStartElection}
                                    className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg"
                                >
                                    総選挙を開始する
                                </button>
                            )}
                        </>
                    )}
                </div>

                {/* Proposals List */}
                <h3 className="font-bold text-slate-700 text-lg border-l-4 border-blue-500 pl-3">
                    投票受付中 ({proposals.filter(p => p.status === 'active').length})
                </h3>

                {loading ? (
                    <div className="text-center py-10 text-slate-400">読み込み中...</div>
                ) : (
                    <div className="space-y-4">
                        {proposals.filter(p => p.status === 'active').length === 0 ? (
                            <div className="text-center py-8 text-slate-400 bg-slate-100 rounded-xl border border-dashed border-slate-300">
                                公約・提案はありません
                            </div>
                        ) : (
                            proposals.filter(p => p.status === 'active').map(proposal => {
                                const myVote = proposal.votes.find(v => v.userId === currentUser?.id)?.vote;
                                const yesVotes = proposal.votes.filter(v => v.vote === 'yes').length;
                                const noVotes = proposal.votes.filter(v => v.vote === 'no').length;
                                const totalVotes = yesVotes + noVotes;
                                const yesPercent = totalVotes > 0 ? (yesVotes / totalVotes) * 100 : 0;

                                return (
                                    <motion.div
                                        key={proposal.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200"
                                    >
                                        <div className="p-5">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded">
                                                    {PROPOSAL_TYPES[proposal.type]?.label || 'その他'}
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    提案者: {proposal.proposer?.name || '匿名'}
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-lg text-slate-800 mb-2">{proposal.title}</h4>
                                            <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                                                {proposal.description}
                                            </p>

                                            {/* Progress Bar */}
                                            <div className="mb-4">
                                                <div className="flex justify-between text-xs font-bold mb-1 text-slate-500">
                                                    <span className="text-blue-600">賛成 {yesVotes}</span>
                                                    <span className="text-red-600">反対 {noVotes}</span>
                                                </div>
                                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex">
                                                    <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${yesPercent}%` }} />
                                                    <div className="h-full bg-red-400 transition-all duration-500" style={{ width: `${100 - yesPercent}%` }} />
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    onClick={() => handleVote(proposal.id, 'yes')}
                                                    disabled={!!myVote}
                                                    className={`py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${myVote === 'yes' ? 'bg-blue-600 text-white shadow-inner' :
                                                        myVote ? 'bg-slate-100 text-slate-400' :
                                                            'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                                        }`}
                                                >
                                                    🙆‍♂️ 賛成
                                                    {myVote === 'yes' && <span className="text-xs bg-white/20 px-1 rounded">済</span>}
                                                </button>
                                                <button
                                                    onClick={() => handleVote(proposal.id, 'no')}
                                                    disabled={!!myVote}
                                                    className={`py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${myVote === 'no' ? 'bg-red-500 text-white shadow-inner' :
                                                        myVote ? 'bg-slate-100 text-slate-400' :
                                                            'bg-red-50 text-red-600 hover:bg-red-100'
                                                        }`}
                                                >
                                                    🙅‍♂️ 反対
                                                    {myVote === 'no' && <span className="text-xs bg-white/20 px-1 rounded">済</span>}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <CreateProposalModal
                        onClose={() => setShowCreateModal(false)}
                        onCreated={() => {
                            fetchProposals();
                            setShowCreateModal(false);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// ------------------------------------------------------------------
// Sub-Components & Constants
// ------------------------------------------------------------------

const PROPOSAL_TYPES: Record<string, { label: string, template: any }> = {
    tax_0: {
        label: '💰 税金ゼロ',
        template: { title: 'みんなの税金を0%にする！', description: 'しばらくの間、買い物の税金をなしにします。お金持ちになれるかも？', type: 'tax_change', params: { target: 'taxRate', value: 0.0 } }
    },
    tax_hike: {
        label: '📈 増税',
        template: { title: '税金を15%に上げる', description: '街を豊かにするために税金を上げます。公共事業が進むかも。', type: 'tax_change', params: { target: 'taxRate', value: 0.15 } }
    },
    grant: {
        label: '💸 給付金',
        template: { title: '市民全員に1000枚配る！', description: '銀行から謎の資金が配られます。無駄遣いしよう！', type: 'grant', params: { amount: 1000 } }
    },
    festival: {
        label: '🎉 毎日お祭り',
        template: { title: '3日間、お祭りモード！', description: 'お店の売上がアップするお祭りを開催します。', type: 'event_trigger', params: { eventId: 'festival_3day' } }
    },
};

function CreateProposalModal({ onClose, onCreated }: { onClose: () => void, onCreated: () => void }) {
    const { currentUser } = useGame();
    const [submitting, setSubmitting] = useState(false);

    const handleCreate = async (key: string) => {
        if (submitting) return;
        setSubmitting(true);
        const template = PROPOSAL_TYPES[key].template;

        try {
            const res = await fetch('/api/politics/propose', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(template),
            });
            if (res.ok) {
                onCreated();
            } else {
                alert('提案できませんでした。資金不足(500枚)かも？');
            }
        } catch (e) {
            console.error(e);
            alert('エラー');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
            >
                <div className="bg-slate-100 p-4 border-b flex justify-between items-center">
                    <h3 className="font-bold text-slate-700">📜 提案を選ぶ</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✖</button>
                </div>
                <div className="p-4 space-y-3">
                    <p className="text-xs text-slate-500 mb-2">※ 提案には <span className="font-bold text-orange-500">500枚</span> かかります</p>
                    {Object.entries(PROPOSAL_TYPES).map(([key, item]) => (
                        <button
                            key={key}
                            onClick={() => handleCreate(key)}
                            disabled={submitting}
                            className="w-full bg-white border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 text-left p-3 rounded-xl transition-all group"
                        >
                            <div className="font-bold text-slate-700 group-hover:text-blue-700">{item.label}</div>
                            <div className="text-xs text-slate-500 truncate">{item.template.title}</div>
                        </button>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
