'use client';

import React, { useState, useMemo } from 'react';
import { useGame } from '@/context/GameContext';
import { useRealtime } from '@/hooks/useRealtime';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Newspaper,
    Gavel,
    MessageSquare,
    TrendingUp,
    Search,
    Menu,
    ArrowLeft,
    ChevronRight,
    Award,
    Eye,
    ThumbsUp
} from 'lucide-react';
import { PlayerIcon } from '@/components/ui/PlayerIcon';

// Types
interface NewsItem {
    id: string;
    type: string;
    title: string;
    content: string;
    timestamp: number;
    relatedUserName?: string;
}

interface Proposal {
    id: string;
    title: string;
    description: string;
    proposer: { name: string };
    status: string;
    votes: { userId: string; vote: 'yes' | 'no' }[];
}

export default function PoliticsNewsApp({ onClose, initialTab = 'news' }: { onClose: () => void, initialTab?: 'news' | 'politics' }) {
    const { currentUser, gameState } = useGame();
    const [activeTab, setActiveTab] = useState<'news' | 'politics'>(initialTab);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const { data: newsData } = useRealtime<NewsItem[]>('/api/news', { interval: 5000 });
    const { data: proposals } = useRealtime<Proposal[]>('/api/politics', { interval: 5000 });

    const currentNews = useMemo(() => newsData || [], [newsData]);
    const activeProposals = useMemo(() => proposals?.filter(p => p.status === 'active') || [], [proposals]);

    const handleBack = () => {
        if (selectedId) setSelectedId(null);
        else onClose();
    };

    return (
        <div className="h-full bg-white text-slate-900 flex flex-col font-sans overflow-hidden">
            <div className="bg-[#a00014] px-4 pt-14 pb-3 shrink-0 flex items-center justify-between shadow-lg text-white">
                <button onClick={handleBack} className="p-2 -ml-2 text-white">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex flex-col items-center">
                    <h1 className="text-white font-black text-xl tracking-tighter italic">News & Politics</h1>
                    <div className="h-0.5 w-12 bg-white/30 rounded-full mt-0.5" />
                </div>
                <button className="p-2 -mr-2 text-white">
                    <Search className="w-6 h-6" />
                </button>
            </div>

            <div className="flex border-b border-slate-200 bg-slate-50 shrink-0">
                <TabItem label="ニュース" active={activeTab === 'news'} onClick={() => setActiveTab('news')} />
                <TabItem label="政治・提案" active={activeTab === 'politics'} onClick={() => setActiveTab('politics')} />
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-100/50 no-scrollbar">
                <AnimatePresence mode="wait">
                    {activeTab === 'news' ? (
                        <motion.div key="news" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 space-y-3 pb-20">
                            <SectionTitle title="注目のニュース" icon={<TrendingUp className="w-4 h-4 text-red-600" />} />
                            {currentNews.map((news) => (
                                <NewsCard key={news.id} news={news} onClick={() => setSelectedId(news.id)} />
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div key="politics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 space-y-3 pb-20">
                            <SectionTitle title="受付中の投票" icon={<Gavel className="w-4 h-4 text-red-600" />} />
                            {activeProposals.map((proposal) => (
                                <ProposalCard key={proposal.id} proposal={proposal} />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

const TabItem = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
    <button onClick={onClick} className={`flex-1 py-3 text-sm font-black transition-all border-b-2 ${active ? 'border-[#a00014] text-[#a00014] bg-white' : 'border-transparent text-slate-400'}`}>
        {label}
    </button>
);

const SectionTitle = ({ title, icon }: { title: string, icon: any }) => (
    <div className="flex items-center gap-2 px-1 mb-2">
        {icon}
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">{title}</h3>
    </div>
);

const NewsCard = ({ news, onClick }: { news: NewsItem, onClick: () => void }) => {
    const mockComments = [
        { name: "経済アナリスト", comment: "物価指数の変動は今後の企業戦略に大きく影響するでしょう。", color: "bg-blue-600" },
        { name: "IT起業家", comment: "テクノロジーの進歩がこの問題を解決する鍵となります。", color: "bg-emerald-600" }
    ];
    const pick = mockComments[Math.floor(Math.random() * mockComments.length)];

    return (
        <motion.div whileTap={{ scale: 0.98 }} onClick={onClick} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group cursor-pointer">
            <div className="p-4">
                <div className="flex justify-between items-start mb-2 text-slate-400">
                    <span className="text-[10px] font-black text-red-600 uppercase tracking-tighter">Business</span>
                    <span className="text-[10px] font-medium">{new Date(news.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <h4 className="font-black text-base text-slate-900 leading-snug group-hover:text-[#a00014] transition-colors mb-4">{news.title}</h4>
                <div className="bg-slate-50 rounded-xl p-3 border-l-4 border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`w-6 h-6 ${pick.color} rounded-full flex items-center justify-center text-[10px] text-white font-black`}>P</div>
                        <span className="text-[11px] font-black text-slate-700">{pick.name} のPick</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed italic">{pick.comment}</p>
                </div>
            </div>
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-slate-400">
                <div className="flex gap-4">
                    <span className="flex items-center gap-1 text-[10px] font-black"><Eye className="w-3 h-3" /> 1,240</span>
                    <span className="flex items-center gap-1 text-[10px] font-black"><MessageSquare className="w-3 h-3" /> 28</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
        </motion.div>
    );
};

const ProposalCard = ({ proposal }: { proposal: Proposal }) => {
    const yesVotes = proposal.votes.filter(v => v.vote === 'yes').length;
    const noVotes = proposal.votes.filter(v => v.vote === 'no').length;
    const total = yesVotes + noVotes;
    const percent = total > 0 ? (yesVotes / total) * 100 : 50;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase">Policy Proposal</span>
            </div>
            <h4 className="font-black text-base text-slate-900 mb-2">{proposal.title}</h4>
            <p className="text-xs text-slate-500 mb-4 line-clamp-2 font-medium">{proposal.description}</p>
            <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span className="text-blue-600">賛成 {yesVotes}</span>
                    <span className="text-red-600">反対 {noVotes}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="h-full bg-blue-500" style={{ width: `${percent}%` }} />
                    <div className="h-full bg-red-500" style={{ width: `${100 - percent}%` }} />
                </div>
            </div>
            <button className="w-full mt-4 bg-slate-900 text-white py-2 rounded-lg text-xs font-black hover:bg-black transition-colors">投票に参加する</button>
        </div>
    );
};
