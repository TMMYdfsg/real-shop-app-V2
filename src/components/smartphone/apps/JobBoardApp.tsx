import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { JOBS, PART_TIME_JOBS } from '@/lib/gameData';
import { canApplyJob, calculateSalary } from '@/lib/career';
import { Button } from '@/components/ui/Button';

// Mock API call function (replace with actual API later)
const applyForJob = async (jobId: string, type: 'full' | 'part') => {
    const res = await fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'apply_job', details: JSON.stringify({ jobId, jobType: type }) })
    });
    return res.json();
};

export const JobBoardApp: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { currentUser, refresh, gameState } = useGame();
    const [activeTab, setActiveTab] = useState<'jobs' | 'part-time'>('jobs');
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

    const jobs = activeTab === 'jobs' ? JOBS : PART_TIME_JOBS;
    const selectedJob = jobs.find(j => j.id === selectedJobId);

    const handleApply = async () => {
        if (!selectedJob) return;

        try {
            const res = await applyForJob(selectedJob.id, activeTab === 'jobs' ? 'full' : 'part');
            if (res.success) {
                alert('採用されました！明日から頑張りましょう！');
                refresh();
                onBack(); // Go back to home
            } else {
                alert(`不採用...: ${res.error}`);
            }
        } catch (e) {
            console.error(e);
            alert('エラーが発生しました');
        }
    };

    if (selectedJob) {
        // Detail View
        const { canApply, reason } = currentUser ? canApplyJob(currentUser, selectedJob) : { canApply: false, reason: 'Login required' };
        const multiplier = gameState?.settings.moneyMultiplier || 1.0;
        const salary = currentUser ? calculateSalary(currentUser, selectedJob, multiplier) : 0;
        const hourlyWage = 'hourlyWage' in selectedJob ? Math.floor((selectedJob as any).hourlyWage * multiplier) : 0;

        // Handle different property structures
        const experienceReq = activeTab === 'jobs'
            ? (selectedJob as any).requirements?.experience
            : (selectedJob as any).experienceOverride;

        return (
            <div className="h-full flex flex-col bg-white text-gray-900">
                <div className="p-4 bg-blue-600 text-white flex items-center gap-2">
                    <button onClick={() => setSelectedJobId(null)}>←</button>
                    <h2 className="font-bold text-lg">詳細</h2>
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                    <h3 className="text-2xl font-bold mb-2">{selectedJob.name}</h3>
                    <div className="mb-4">
                        <span className={`px-2 py-1 rounded text-xs text-white ${activeTab === 'jobs' ? 'bg-blue-500' : 'bg-green-500'}`}>
                            {activeTab === 'jobs' ? '正社員' : 'アルバイト'}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                            {activeTab === 'jobs' ? 'ランク' + (selectedJob as any).rank : '時給'}
                        </span>
                    </div>

                    <div className="bg-gray-100 p-3 rounded-lg mb-4">
                        <p className="font-bold text-lg text-blue-800">
                            {activeTab === 'jobs' ? `月給 ¥${salary.toLocaleString()}` : `時給 ¥${hourlyWage.toLocaleString()}`}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">※能力・資格により変動</p>
                    </div>

                    <div className="mb-4">
                        <h4 className="font-bold border-b mb-2">仕事内容</h4>
                        <p className="text-sm">{selectedJob.description}</p>
                    </div>

                    <div className="mb-4">
                        <h4 className="font-bold border-b mb-2">応募条件</h4>
                        <ul className="text-sm list-disc pl-4 space-y-1">
                            {selectedJob.requirements.qualifications?.map(q => (
                                <li key={q}>必須資格: {q}</li> // TODO: Resolve name
                            ))}
                            {experienceReq && <li>実務経験: {experienceReq}年以上</li>}
                            {Object.keys(selectedJob.requirements.qualifications || {}).length === 0 && !('experience' in selectedJob.requirements) && <li>特になし</li>}
                        </ul>
                    </div>

                    {!canApply && (
                        <div className="bg-red-100 text-red-700 p-2 rounded text-sm mb-4">
                            ⚠️ {reason}
                        </div>
                    )}
                </div>
                <div className="p-4 border-t">
                    <Button className="w-full" disabled={!canApply} onClick={handleApply}>
                        この仕事に応募する
                    </Button>
                </div>
            </div>
        );
    }

    // List View
    return (
        <div className="h-full flex flex-col bg-slate-50 text-gray-900">
            <div className="p-4 bg-blue-600 text-white">
                <h2 className="font-bold text-lg">求人検索</h2>
            </div>

            <div className="flex border-b bg-white">
                <button
                    className={`flex-1 py-3 text-sm font-bold ${activeTab === 'jobs' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}
                    onClick={() => setActiveTab('jobs')}
                >
                    正社員
                </button>
                <button
                    className={`flex-1 py-3 text-sm font-bold ${activeTab === 'part-time' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}
                    onClick={() => setActiveTab('part-time')}
                >
                    アルバイト
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {jobs.map(job => (
                    <div
                        key={job.id}
                        className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center cursor-pointer hover:bg-blue-50 transition-colors"
                        onClick={() => setSelectedJobId(job.id)}
                    >
                        <div>
                            <div className="font-bold text-sm">{job.name}</div>
                            <div className="text-xs text-gray-500 mt-1">
                                {activeTab === 'jobs' ? `月給 ¥${Math.floor((job as any).salary * (gameState?.settings.moneyMultiplier || 1)).toLocaleString()}~` : `時給 ¥${Math.floor((job as any).hourlyWage * (gameState?.settings.moneyMultiplier || 1)).toLocaleString()}`}
                            </div>
                        </div>
                        <div className="text-gray-400">›</div>
                    </div>
                ))}
            </div>
        </div>
    );
};
