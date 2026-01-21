import { Card } from '@/components/ui/Card';
import { User } from '@/types';
import { motion } from 'framer-motion';

interface StatusCardProps {
    user: User;
    showBank: () => void;
}

export const StatusCard = ({ user, showBank }: StatusCardProps) => {
    return (
        <Card className="relative overflow-hidden border-0 shadow-2xl bg-[#0f172a] text-white p-0 rounded-3xl group">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,_#312e81_0%,_#0f172a_100%)] opacity-80" />
            <motion.div
                animate={{ x: [0, 30, 0], y: [0, 20, 0], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-indigo-500/30 blur-[80px] rounded-full"
            />
            <motion.div
                animate={{ x: [0, -30, 0], y: [0, -20, 0], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-[-50px] left-[-30px] w-48 h-48 bg-purple-500/20 blur-[60px] rounded-full"
            />

            {/* Glass Surface */}
            <div className="relative z-10 p-7 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl h-full flex flex-col justify-between">

                {/* Main Balance Section */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2 opacity-70">
                        <span className="text-xs font-bold tracking-widest uppercase text-indigo-200">Total Assets</span>
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-indigo-200/30 to-transparent" />
                    </div>
                    <div className="text-sm font-medium text-indigo-100 mb-1">現在の所持金</div>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-200 drop-shadow-sm"
                    >
                        {user.balance.toLocaleString()}
                        <span className="text-lg font-normal ml-2 text-indigo-300">枚</span>
                    </motion.div>
                </div>

                {/* Sub Stats Grid - Preserving exact fields requested */}
                <div className="grid grid-cols-3 gap-3">
                    {/* Savings */}
                    <div className="bg-slate-900/40 p-3 rounded-2xl border border-white/5 backdrop-blur-md">
                        <div className="text-[10px] text-indigo-300 font-bold mb-1 uppercase tracking-wider">貯金</div>
                        <div className="font-bold text-lg text-white font-mono">
                            {user.deposit.toLocaleString()}
                        </div>
                    </div>

                    {/* Debt */}
                    <div className="bg-slate-900/40 p-3 rounded-2xl border border-white/5 backdrop-blur-md relative overflow-hidden">
                        <div className="text-[10px] text-rose-300 font-bold mb-1 uppercase tracking-wider">借金</div>
                        <div className="font-bold text-lg text-rose-100 font-mono relative z-10">
                            {user.debt.toLocaleString()}
                        </div>
                        {user.debt > 0 && (
                            <div className="absolute inset-0 bg-rose-500/10 animate-pulse" />
                        )}
                    </div>

                    {/* Credit Score */}
                    <div
                        className="bg-gradient-to-br from-indigo-600/80 to-purple-700/80 p-3 rounded-2xl border border-white/10 backdrop-blur-md cursor-pointer hover:scale-105 transition-transform shadow-lg shadow-indigo-900/20"
                        onClick={showBank}
                    >
                        <div className="text-[10px] text-white/80 font-bold mb-1 uppercase tracking-wider">信用スコア</div>
                        <div className="font-bold text-lg text-white font-mono flex items-center justify-between">
                            {user.creditScore || 500}
                            <span className="text-sm bg-white/20 rounded-full w-5 h-5 flex items-center justify-center">↗</span>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};
