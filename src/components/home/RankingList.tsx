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
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/60 p-4">
            <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                <span>🏆</span> お金持ちランキング
            </h3>
            <div className="space-y-2">
                {ranking.map((user, index) => {
                    const isMe = user.id === currentUserId;
                    return (
                        <motion.div
                            key={user.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex items-center gap-3 p-2 rounded-xl border ${isMe
                                    ? 'bg-indigo-50 border-indigo-100'
                                    : 'bg-white border-slate-100'
                                }`}
                        >
                            <div className={`
                                w-8 h-8 flex items-center justify-center rounded-full font-black text-lg
                                ${index === 0 ? 'text-yellow-500 bg-yellow-100' :
                                    index === 1 ? 'text-slate-400 bg-slate-100' :
                                        index === 2 ? 'text-amber-600 bg-amber-100' : 'text-slate-400'}
                            `}>
                                {index + 1}
                            </div>

                            <PlayerIcon playerIcon={user.playerIcon} playerName={user.name} size={32} />

                            <div className="flex-1 min-w-0">
                                <div className={`text-sm font-bold truncate ${isMe ? 'text-indigo-900' : 'text-slate-700'}`}>
                                    {user.name}
                                    {isMe && <span className="text-xs text-indigo-500 ml-1">(あなた)</span>}
                                </div>
                            </div>

                            <div className="text-sm font-bold text-slate-600">
                                {user.balance.toLocaleString()}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};
