'use client';

import React, { useState, useMemo } from 'react';
import { useGame } from '@/context/GameContext';
import { JOBS, PART_TIME_JOBS, QUALIFICATIONS } from '@/lib/gameData';
import { canApplyJob, calculateSalary } from '@/lib/career';
import { Button } from '@/components/ui/Button';
import { AppHeader } from '../AppHeader';
import {
    Search,
    Map as MapIcon,
    List,
    ChevronRight,
    Clock,
    Coins,
    Filter,
    Navigation,
    Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// Loading map lazily or using a simplified placeholder if real map is too heavy for smartphone view
// but let's try to use GoogleMap if possible. 
// For now, I will build the Townwork UI first.

import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

const mapContainerStyle = {
    width: '100%',
    height: '100%'
};

const mapOptions = {
    disableDefaultUI: true,
    zoomControl: false,
    styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    ]
};

export const JobBoardApp: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { currentUser, refresh, gameState } = useGame();
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    const [activeTab, setActiveTab] = useState<'jobs' | 'part-time'>('part-time'); // Townwork defaults to part-time
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
    const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
    });

    const qualificationsById = useMemo(() => {
        return new Map(QUALIFICATIONS.map(q => [q.id, q.name]));
    }, []);

    const jobTypeLabels: Record<string, string> = {
        public: '公共',
        medical: '医療',
        creative: 'クリエイティブ',
        technical: '技術',
        service: 'サービス',
        business: 'ビジネス',
        freelance: 'フリー',
        criminal: '犯罪',
        agriculture: '農業',
        educational: '教育'
    };

    const jobs = useMemo(() => {
        const source = activeTab === 'jobs' ? JOBS : PART_TIME_JOBS;
        const typeOrder = ['business', 'technical', 'medical', 'public', 'creative', 'service', 'agriculture', 'educational', 'freelance', 'criminal'];
        return [...source].sort((a, b) => {
            const typeIndexA = typeOrder.indexOf(a.type);
            const typeIndexB = typeOrder.indexOf(b.type);
            if (typeIndexA !== typeIndexB) return typeIndexA - typeIndexB;
            if ('salary' in a && 'salary' in b) return (b.salary || 0) - (a.salary || 0);
            if ('hourlyWage' in a && 'hourlyWage' in b) return (b.hourlyWage || 0) - (a.hourlyWage || 0);
            return a.name.localeCompare(b.name, 'ja-JP');
        });
    }, [activeTab]);

    const selectedJob = jobs.find(j => j.id === selectedJobId);

    // Filter places that could offer jobs based on category
    const jobPlaces = useMemo(() => {
        if (!gameState?.places || !gameState?.lands) return [];
        return gameState.places.filter(p => p.buildingCategory === 'shop' || p.buildingCategory === 'company').map(p => {
            const land = gameState.lands?.find(l => l.id === p.location.landId);
            return { ...p, location: land?.location };
        }).filter(p => p.location);
    }, [gameState?.places, gameState?.lands]);

    const handleApply = async () => {
        if (!selectedJob) return;
        try {
            const res = await fetch('/api/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'apply_job',
                    requesterId: currentUser?.id,
                    details: JSON.stringify({ jobId: selectedJob.id, jobType: activeTab === 'jobs' ? 'full' : 'part' })
                })
            });
            const data = await res.json();
            if (data.success) {
                alert('採用されました！明日から頑張りましょう！');
                refresh();
                onBack();
            } else {
                alert(`不採用...: ${data.error}`);
            }
        } catch (e) {
            console.error(e);
            alert('エラーが発生しました');
        }
    };

    if (selectedJob) {
        const { canApply, reason } = currentUser ? canApplyJob(currentUser, selectedJob) : { canApply: false, reason: 'ログインが必要です' };
        const multiplier = gameState?.settings.moneyMultiplier || 1.0;
        const salary = currentUser ? calculateSalary(currentUser, selectedJob, multiplier) : 0;
        const hourlyWage = 'hourlyWage' in selectedJob ? Math.floor((selectedJob as any).hourlyWage * multiplier) : 0;

        return (
            <div className="h-full flex flex-col bg-white text-slate-900 font-sans">
                <div className="bg-[#fae100] px-4 pt-12 pb-4 shrink-0 flex items-center justify-between">
                    <button onClick={() => setSelectedJobId(null)} className="w-8 h-8 flex items-center justify-center font-bold text-xl">←</button>
                    <h2 className="font-black text-lg">求人詳細</h2>
                    <div className="w-8" />
                </div>

                <div className="flex-1 overflow-y-auto p-5 pb-10">
                    <div className="flex gap-2 mb-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black ${activeTab === 'jobs' ? 'bg-blue-600 text-white' : 'bg-orange-500 text-white'}`}>
                            {activeTab === 'jobs' ? '正社員' : 'アルバイト'}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-slate-900 text-[10px] font-black text-white">
                            {jobTypeLabels[selectedJob.type] || 'その他'}
                        </span>
                        {selectedJob.requirements.qualifications?.map(q => (
                            <span key={q} className="px-3 py-1 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                                {qualificationsById.get(q) || q}
                            </span>
                        ))}
                    </div>

                    <h3 className="text-2xl font-black mb-4 leading-tight">{selectedJob.name}</h3>

                    <div className="bg-[#fff9c4] border border-[#fae100] p-4 rounded-2xl mb-6">
                        <div className="flex items-center gap-2 mb-1">
                            <Coins className="w-4 h-4 text-orange-600" />
                            <span className="text-xs font-bold text-slate-500">{activeTab === 'jobs' ? '想定月給' : '時給'}</span>
                        </div>
                        <div className="text-2xl font-black text-slate-900">
                            {selectedJob.id === 'job_debugger' ? (
                                <span className="text-red-600">報酬なし (デバッグ用)</span>
                            ) : (
                                activeTab === 'jobs' ? `¥${salary.toLocaleString()}` : `¥${hourlyWage.toLocaleString()}`
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h4 className="flex items-center gap-2 font-black text-sm mb-2 border-l-4 border-[#fae100] pl-2">仕事内容</h4>
                            <p className="text-sm text-slate-600 leading-relaxed">{selectedJob.description}</p>
                        </div>

                        <div>
                            <h4 className="flex items-center gap-2 font-black text-sm mb-2 border-l-4 border-[#fae100] pl-2">応募条件</h4>
                            <p className="text-sm text-slate-600">
                                {(selectedJob.requirements as any).experience ? `実務経験 ${(selectedJob.requirements as any).experience}年以上` : '特になし'}
                            </p>
                        </div>
                    </div>

                    {!canApply && (
                        <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold flex items-start gap-2">
                            <span>⚠️</span>
                            <span>{reason}</span>
                        </div>
                    )}
                </div>

                <div className="p-5 border-t border-slate-100 bg-white">
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        disabled={!canApply}
                        onClick={handleApply}
                        className={`w-full py-4 rounded-2xl font-black text-lg shadow-lg shadow-yellow-200 transition-all ${canApply ? 'bg-[#fae100] text-slate-900 active:bg-yellow-400' : 'bg-slate-100 text-slate-300'}`}
                    >
                        この仕事に応募する
                    </motion.button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[#f5f5f5] text-slate-900 overflow-hidden font-sans">
            {/* Townwork Header */}
            <div className="bg-[#fae100] px-4 pt-12 pb-4 shrink-0 shadow-sm relative z-50">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={onBack} className="w-10 h-10 flex items-center justify-center font-bold text-xl">←</button>
                    <div className="flex items-center gap-1">
                        <span className="font-black italic text-xl tracking-tighter">TOWNWORK</span>
                        <div className="w-1.5 h-1.5 bg-black rounded-full mt-1" />
                    </div>
                    <button className="w-10 h-10 flex items-center justify-center">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-black/5 p-1 rounded-xl">
                    <TownworkTab
                        label="アルバイト"
                        active={activeTab === 'part-time'}
                        onClick={() => setActiveTab('part-time')}
                    />
                    <TownworkTab
                        label="正社員"
                        active={activeTab === 'jobs'}
                        onClick={() => setActiveTab('jobs')}
                    />
                </div>
            </div>

            {/* View Toggle */}
            <div className="flex px-4 py-3 bg-white border-b border-slate-200 justify-between items-center shrink-0 shadow-sm relative z-40">
                <div className="flex gap-2">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-black transition-all ${viewMode === 'list' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <List className="w-3.5 h-3.5" /> リスト
                    </button>
                    <button
                        onClick={() => setViewMode('map')}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-black transition-all ${viewMode === 'map' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <MapIcon className="w-3.5 h-3.5" /> マップ
                    </button>
                </div>
                <div className="text-[10px] font-black text-slate-400">
                    {jobs.length}件の求人
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative">
                <AnimatePresence mode="wait">
                    {viewMode === 'list' || !isLoaded ? (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="h-full overflow-y-auto p-4 space-y-3 pb-10"
                        >
                            {jobs.map(job => (
                                <JobListItem
                                    key={job.id}
                                    job={job}
                                    onClick={() => setSelectedJobId(job.id)}
                                    type={activeTab}
                                />
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="map"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="h-full relative"
                        >
                            <GoogleMap
                                mapContainerStyle={mapContainerStyle}
                                center={{ lat: 35.6895, lng: 139.6917 }} // Shinjuku as default
                                zoom={14}
                                options={mapOptions}
                                onLoad={setMapInstance}
                            >
                                {jobPlaces.map(place => (
                                    <Marker
                                        key={place.id}
                                        position={place.location!}
                                        onClick={() => setSelectedPlaceId(place.id)}
                                        icon={{
                                            url: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
                                            scaledSize: new google.maps.Size(40, 40)
                                        }}
                                    />
                                ))}

                                {selectedPlaceId && (() => {
                                    const place = jobPlaces.find(p => p.id === selectedPlaceId);
                                    const job = jobs[Math.floor(Math.random() * jobs.length)]; // Link random job to place for demo

                                    return (
                                        <InfoWindow
                                            position={place?.location as google.maps.LatLngLiteral}
                                            onCloseClick={() => setSelectedPlaceId(null)}
                                        >
                                            <div className="p-2 min-w-[150px] max-w-[200px]" onClick={() => setSelectedJobId(job.id)}>
                                                <div className="text-[10px] font-bold text-orange-500 mb-1">{place?.name}</div>
                                                <div className="font-black text-xs leading-tight mb-1">{job.name}</div>
                                                <div className="text-xs font-black text-slate-900 mb-2">
                                                    ¥{(job as any).hourlyWage?.toLocaleString() || (job as any).salary?.toLocaleString()}
                                                </div>
                                                <button className="w-full bg-[#fae100] py-1.5 rounded-lg text-[10px] font-black">詳細を見る</button>
                                            </div>
                                        </InfoWindow>
                                    );
                                })()}
                            </GoogleMap>

                            {/* Floating Filter Button */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                                <button className="bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 font-black text-xs active:scale-95 transition-all">
                                    <Navigation className="w-4 h-4" /> このエリアで探す
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const TownworkTab = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all ${active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
    >
        {label}
    </button>
);

const JobListItem = ({ job, onClick, type }: { job: any, onClick: () => void, type: 'jobs' | 'part-time' }) => {
    const hourlyWage = job.hourlyWage || (job.salary / 160); // approximation if missing
    const jobTypeLabels: Record<string, string> = {
        public: '公共',
        medical: '医療',
        creative: 'クリエイティブ',
        technical: '技術',
        service: 'サービス',
        business: 'ビジネス',
        freelance: 'フリー',
        criminal: '犯罪',
        agriculture: '農業',
        educational: '教育'
    };

    return (
        <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-3 group cursor-pointer relative overflow-hidden"
        >
            {/* Zebra pattern accent */}
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#fae100]" />

            <div className="flex justify-between items-start pl-2">
                <div className="flex-1">
                    <h4 className="font-black text-base text-slate-900 group-hover:text-blue-600 transition-colors leading-tight mb-1">{job.name}</h4>
                    <div className="flex items-center gap-1.5 mb-2">
                        <Briefcase className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-500">店舗・事業所勤務</span>
                    </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-slate-900 text-[9px] font-black text-white">
                    {jobTypeLabels[job.type] || 'その他'}
                </span>
            </div>

            <div className="flex gap-4 pl-2">
                <div className="flex flex-col">
                    <div className="flex items-center gap-1 mb-0.5">
                        <Coins className="w-3.5 h-3.5 text-orange-500" />
                        <span className="text-[10px] font-black text-slate-400">{type === 'jobs' ? '月給' : '時給'}</span>
                    </div>
                    <div className="text-lg font-black text-slate-900 tracking-tight">
                        ¥{job.id === 'job_debugger' ? '0' : (type === 'jobs' ? (job.salary || 0).toLocaleString() : (job.hourlyWage || 0).toLocaleString())}
                        <span className="text-[10px] ml-0.5">{type === 'jobs' ? '〜' : ''}</span>
                    </div>
                </div>

                <div className="flex flex-col">
                    <div className="flex items-center gap-1 mb-0.5">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-[10px] font-black text-slate-400">シフト</span>
                    </div>
                    <div className="text-xs font-black text-slate-800 leading-tight">
                        週2・3日〜OK<br />
                        <span className="text-[10px] font-bold text-slate-500">1日4h〜相談可</span>
                    </div>
                </div>
            </div>

            <div className="flex gap-1.5 mt-1 pl-2">
                <span className="bg-slate-50 text-slate-500 text-[9px] font-black px-2 py-0.5 rounded border border-slate-100">未経験歓迎</span>
                <span className="bg-slate-50 text-slate-500 text-[9px] font-black px-2 py-0.5 rounded border border-slate-100">駅チカ</span>
                <span className="bg-slate-50 text-slate-500 text-[9px] font-black px-2 py-0.5 rounded border border-slate-100">まかない有</span>
            </div>

            <ChevronRight className="absolute bottom-4 right-4 w-5 h-5 text-slate-200 group-hover:text-slate-400 transition-transform group-hover:translate-x-1" />
        </motion.div>
    );
};
