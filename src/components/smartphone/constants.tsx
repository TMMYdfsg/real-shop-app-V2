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
    // Row 1
    { id: 'map', name: '地図', icon: <MapIcon />, color: 'bg-emerald-600', description: '街マップを開く' },
    { id: 'bank', name: 'Olive', icon: <BankIcon />, color: 'bg-emerald-800', description: '銀行・資産管理' },
    { id: 'job_board', name: '求人', icon: <JobIcon />, color: 'bg-indigo-600', description: '求人情報を確認' },
    { id: 'life_status', name: '生活', icon: <StatusIcon />, color: 'bg-pink-500', description: 'ライフステータス' },

    // Row 2
    { id: 'family', name: '連絡先', icon: <FamilyIcon />, color: 'bg-orange-500', description: '家族・パートナー' },
    { id: 'audit_log', name: 'ログ', icon: <AuditIcon />, color: 'bg-slate-600', description: '監査ログ確認' },
    { id: 'quests', name: 'クエスト', icon: <QuestIcon />, color: 'bg-yellow-400', description: '目標・実績' },
    { id: 'sns', name: 'つぶやき', icon: <SNSIcon />, color: 'bg-sky-500', description: 'みんなの投稿を見る' },
    { id: 'messenger', name: 'トーク', icon: <MessageIcon />, color: 'bg-blue-500', description: 'メッセージを送る' },
    { id: 'phone', name: '電話', icon: <PhoneIcon />, color: 'bg-green-500', description: '通話する' },
    { id: 'politics', name: '政治', icon: <PoliticsIcon />, color: 'bg-teal-700', description: '投票・提案' },

    // Row 4
    { id: 'vacation', name: '休暇', icon: <VacationIcon />, color: 'bg-cyan-500', description: '有給休暇の申請' },
    { id: 'camera', name: 'カメラ', icon: <CameraIcon />, color: 'bg-red-500', description: '写真を撮る' },
    { id: 'shopping', name: 'ストア', icon: <ShoppingIcon />, color: 'bg-rose-500', description: 'アプリをダウンロード' },
    { id: 'settings', name: '設定', icon: <SettingsIcon />, color: 'bg-gray-500', description: 'アプリ設定' },

    // Other Apps
    { id: 'dark_web', name: '裏サイト', icon: <DarkWebIcon />, color: 'bg-slate-900', description: 'アクセス注意...' },
    { id: 'news', name: 'ニュース', icon: <NewsIcon />, color: 'bg-orange-600', description: '最新ニュース' },
    { id: 'video', name: '動画', icon: <VideoIcon />, color: 'bg-red-600', description: '人気の動画' },
];

export const DOCK_APPS = []; // Floating dock removed as per grid-only request, but we can keep it empty or use for something else.

