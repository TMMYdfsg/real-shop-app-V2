import { User } from '@/types';
import { PlayerIcon } from '@/components/ui/PlayerIcon';
import { motion } from 'framer-motion';

interface RankingListProps {
    users: User[];
    currentUserId: string;
}

export const RankingList = ({ users, currentUserId }: RankingListProps) => {
    // Filter and Sort
    const ranking = [...users]
        .filter(u => u.role === 'player')
        .sort((a, b) => b.balance - a.balance)
        .slice(0, 5); // Top 5 only to save space

    return (
        <div className="bg-white/5 backdrop-blur-xl rounded-[24px] border border-white/10 p-5 shadow-xl overflow-hidden relative">
            <h3 className="font-black text-indigo-100 mb-4 flex items-center gap-2 uppercase tracking-wider text-sm">
                <span className="text-xl">🏆</span> 世界長者番付
            </h3>

            <div className="space-y-3 relative z-10">
                {ranking.map((user, index) => {
                    const isMe = user.id === currentUserId;
                    return (
                        <motion.div
                            key={user.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex items-center gap-4 p-3 rounded-2xl border transition-all ${isMe
                                ? 'bg-indigo-600/20 border-indigo-500/50 shadow-lg shadow-indigo-900/20'
                                : 'bg-slate-900/40 border-white/5 hover:bg-white/5'
                                }`}
                        >
                            <div className={`
                                w-10 h-10 flex items-center justify-center rounded-xl font-black text-lg shadow-inner
                                ${index === 0 ? 'bg-gradient-to-br from-yellow-300 to-amber-600 text-amber-900 border border-yellow-200/50' :
                                    index === 1 ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800 border border-white/30' :
                                        index === 2 ? 'bg-gradient-to-br from-orange-300 to-amber-700 text-amber-950 border border-orange-200/50' :
                                            'bg-slate-800 text-slate-500 border border-white/5'}
                            `}>
                                {index + 1}
                            </div>

                            <PlayerIcon playerIcon={user.playerIcon} playerName={user.name} size={40} />

                            <div className="flex-1 min-w-0">
                                <div className={`font-bold truncate text-base ${isMe ? 'text-indigo-200' : 'text-slate-200'}`}>
                                    {user.name}
                                    {isMe && <span className="text-[10px] text-indigo-400 ml-2 border border-indigo-500/30 px-1.5 py-0.5 rounded uppercase tracking-wider">YOU</span>}
                                </div>
                            </div>

                            <div className="font-mono font-bold text-emerald-400 text-lg tracking-tight">
                                {user.balance.toLocaleString()}枚
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Background Glints */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-500/5 blur-[40px] rounded-full pointer-events-none" />
        </div>
    );
};
