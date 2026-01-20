import { Card } from '@/components/ui/Card';
import { User } from '@/types';
import { motion } from 'framer-motion';

interface StatusCardProps {
    user: User;
    showBank: () => void;
}

export const StatusCard = ({ user, showBank }: StatusCardProps) => {
    return (
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6">
            <div className="relative z-10">
                <div className="text-indigo-100 text-sm font-medium mb-1">現在の所持金</div>
                <div className="text-4xl font-black tracking-tight mb-6">
                    {user.balance.toLocaleString()}
                    <span className="text-lg font-normal ml-1 opacity-80">枚</span>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                        <div className="text-xs text-indigo-200 mb-1">貯金</div>
                        <div className="font-bold text-lg">{user.deposit.toLocaleString()}</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                        <div className="text-xs text-indigo-200 mb-1">借金</div>
                        <div className="font-bold text-lg text-red-300">{user.debt.toLocaleString()}</div>
                    </div>
                    <div
                        className="bg-white/20 rounded-lg p-3 backdrop-blur-sm cursor-pointer hover:bg-white/30 transition-colors"
                        onClick={showBank}
                    >
                        <div className="text-xs text-indigo-200 mb-1">信用スコア</div>
                        <div className="font-bold text-lg flex items-center justify-between">
                            {user.creditScore || 500}
                            <span className="text-sm">↗</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Decor */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-black/10 rounded-full blur-xl" />
        </Card>
    );
};
