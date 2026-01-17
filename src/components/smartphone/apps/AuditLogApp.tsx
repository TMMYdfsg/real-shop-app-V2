import React from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/Button';

interface AuditLogAppProps {
    onBack: () => void;
}

export const AuditLogApp: React.FC<AuditLogAppProps> = ({ onBack }) => {
    const { currentUser } = useGame();

    if (!currentUser) return null;

    const auditLogs = currentUser.auditLogs || [];
    const suspicionScore = currentUser.suspicionScore || 0;

    // スコアに応じた状態テキスト
    const getStatusText = (score: number) => {
        if (score >= 80) return '💀 危険水準 (監査確定)';
        if (score >= 50) return '⚠️ 監視対象';
        if (score >= 20) return '👁️ 注意';
        return '✅ 健全';
    };

    const getStatusColor = (score: number) => {
        if (score >= 80) return 'text-red-500';
        if (score >= 50) return 'text-orange-500';
        if (score >= 20) return 'text-yellow-400';
        return 'text-green-500';
    };

    return (
        <div className="h-full flex flex-col bg-gray-900 text-white">
            {/* Header */}
            <div className="p-4 border-b border-gray-700 flex items-center gap-2">
                <Button size="sm" variant="ghost" className="text-white p-0" onClick={onBack}>⬅️</Button>
                <h2 className="font-bold text-lg">行動記録 (監査ログ)</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Score Panel */}
                <div className="bg-gray-800 rounded-lg p-4 text-center border border-gray-700">
                    <div className="text-gray-400 text-sm mb-1">不正疑惑スコア</div>
                    <div className={`text-4xl font-bold mb-2 ${getStatusColor(suspicionScore)}`}>
                        {suspicionScore}<span className="text-base text-gray-500">/100</span>
                    </div>
                    <div className={`text-sm font-bold border-t border-gray-700 pt-2 ${getStatusColor(suspicionScore)}`}>
                        {getStatusText(suspicionScore)}
                    </div>
                    <div className="w-full bg-gray-700 h-2 rounded-full mt-2 overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 ${scoreToColor(suspicionScore)}`}
                            style={{ width: `${suspicionScore}%` }}
                        />
                    </div>
                </div>

                {/* Warning Card */}
                {suspicionScore > 0 && (
                    <div className="bg-red-900/30 border border-red-800 p-3 rounded text-xs text-red-200">
                        🔔 ヒント: 不審な取引を続けると税務調査イベントが発生し、多額の追徴課税や罰金が科される可能性があります。
                    </div>
                )}

                {/* Log List */}
                <div>
                    <h3 className="text-sm font-bold text-gray-400 mb-2">履歴一覧</h3>
                    {auditLogs.length === 0 ? (
                        <div className="text-center text-gray-500 py-4 text-sm">
                            記録されたログはありません。
                            <br />健全な経済活動を続けましょう。
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {[...auditLogs].reverse().map(log => (
                                <div key={log.id} className="bg-gray-800 rounded p-3 border-l-4 border-gray-600 text-sm">
                                    <div className="flex justify-between items-start mb-1">
                                        <SeverityBadge severity={log.severity} />
                                        <span className="text-xs text-gray-500">
                                            {new Date(log.timestamp).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="font-bold mb-1">{actionTypeToLabel(log.actionType)}</div>
                                    <div className="text-xs text-gray-300 break-all">
                                        {formatDetails(log.details)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Helpers
const scoreToColor = (s: number) => {
    if (s >= 80) return 'bg-red-600';
    if (s >= 50) return 'bg-orange-500';
    if (s >= 20) return 'bg-yellow-500';
    return 'bg-green-500';
};

const SeverityBadge = ({ severity }: { severity: string }) => {
    if (severity === 'critical') return <span className="text-xs font-bold bg-red-600 text-white px-1.5 py-0.5 rounded">重要</span>;
    if (severity === 'warning') return <span className="text-xs font-bold bg-orange-500 text-white px-1.5 py-0.5 rounded">警告</span>;
    return <span className="text-xs font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded">記録</span>;
};

const actionTypeToLabel = (type: string) => {
    switch (type) {
        case 'resale_attempt': return '転売疑惑';
        case 'high_value_transaction': return '高額取引';
        case 'tax_evasion': return '脱税疑惑';
        case 'insider_trading': return 'インサイダー取引';
        case 'suspicious_activity': return '不審な活動';
        default: return type;
    }
};

const formatDetails = (details: string | object) => {
    try {
        const obj = typeof details === 'string' ? JSON.parse(details) : details;
        if (obj.itemId) {
            return `${obj.stock}個 (${obj.price}円/個) (原価: ${obj.cost}円)`;
        }
        return JSON.stringify(obj);
    } catch {
        return String(details);
    }
}
