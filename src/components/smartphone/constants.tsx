import React from 'react';
import {
    PhoneIcon, MessageIcon, SNSIcon, VideoIcon, NewsIcon, MapIcon,
    BankIcon, JobIcon, StatusIcon, FamilyIcon, AuditIcon, CryptoIcon,
    QuestIcon, DarkWebIcon, ShoppingIcon, CameraIcon, SettingsIcon,
    PoliticsIcon, VacationIcon
} from './assets/Icons';

export interface App {
    id: string;
    name: string;
    icon: React.ReactNode;
    color: string;
    description: string;
}

export const APPS: App[] = [
    { id: 'phone', name: '電話', icon: <PhoneIcon />, color: 'bg-green-500', description: '通話・履歴' },
    { id: 'message', name: 'メッセージ', icon: <MessageIcon />, color: 'bg-blue-500', description: 'メッセージの送受信' },
    { id: 'sns', name: 'Buzzer', icon: <SNSIcon />, color: 'bg-indigo-600', description: 'つぶやきSNS' },
    { id: 'video', name: 'Tube', icon: <VideoIcon />, color: 'bg-red-600', description: '動画共有' },
    { id: 'news', name: 'ニュース', icon: <NewsIcon />, color: 'bg-orange-500', description: 'ワールドニュース' },
    { id: 'map', name: '地図', icon: <MapIcon />, color: 'bg-emerald-600', description: '街マップを開く' },
    { id: 'bank', name: '銀行', icon: <BankIcon />, color: 'bg-blue-700', description: '口座管理' },
    { id: 'job_board', name: '求人', icon: <JobIcon />, color: 'bg-violet-600', description: '求人情報を確認' },
    { id: 'status', name: '生活', icon: <StatusIcon />, color: 'bg-pink-500', description: 'ライフステータス' },
    { id: 'family', name: '連絡先', icon: <FamilyIcon />, color: 'bg-orange-500', description: '家族・パートナー' },
    { id: 'audit', name: 'ログ', icon: <AuditIcon />, color: 'bg-slate-600', description: '監査ログ確認' },
    { id: 'crypto', name: '資産', icon: <CryptoIcon />, color: 'bg-purple-600', description: '取引・チャート' },
    { id: 'quests', name: 'クエスト', icon: <QuestIcon />, color: 'bg-yellow-400', description: '目標・実績' },
    { id: 'dark_web', name: 'Hidden', icon: <DarkWebIcon />, color: 'bg-slate-900', description: 'Encrypted' },
    { id: 'shopping', name: 'ストア', icon: <ShoppingIcon />, color: 'bg-rose-500', description: '準備中' },
    { id: 'camera', name: 'カメラ', icon: <CameraIcon />, color: 'bg-red-500', description: 'カメラ' },
    { id: 'settings', name: '設定', icon: <SettingsIcon />, color: 'bg-gray-500', description: '設定' },
    { id: 'politics', name: '政治', icon: <PoliticsIcon />, color: 'bg-teal-700', description: '投票・提案' },
    { id: 'vacation', name: '休暇', icon: <VacationIcon />, color: 'bg-cyan-500', description: '有給休暇の申請' },
];

export const DOCK_APPS = ['phone', 'sns', 'message', 'video'];
