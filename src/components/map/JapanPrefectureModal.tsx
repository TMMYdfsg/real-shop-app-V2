import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Land } from '@/types';

interface JapanPrefectureModalProps {
    isOpen: boolean;
    onClose: () => void;
    prefectures: Land[];
    onSelect: (land: Land) => void;
    currentBalance: number;
}

export const JapanPrefectureModal: React.FC<JapanPrefectureModalProps> = ({
    isOpen,
    onClose,
    prefectures,
    onSelect,
    currentBalance
}) => {
    // 地方ごとにグループ化（簡易的）
    const regions = [
        { name: '北海道・東北', ids: ['hokkaido', 'aomori', 'iwate', 'miyagi', 'akita', 'yamagata', 'fukushima'] },
        { name: '関東', ids: ['ibaraki', 'tochigi', 'gunma', 'saitama', 'chiba', 'tokyo', 'kanagawa'] },
        { name: '中部', ids: ['niigata', 'toyama', 'ishikawa', 'fukui', 'yamanashi', 'nagano', 'gifu', 'shizuoka', 'aichi'] },
        { name: '近畿', ids: ['mie', 'shiga', 'kyoto', 'osaka', 'hyogo', 'nara', 'wakayama'] },
        { name: '中国・四国', ids: ['tottori', 'shimane', 'okayama', 'hiroshima', 'yamaguchi', 'tokushima', 'kagawa', 'ehime', 'kochi'] },
        { name: '九州・沖縄', ids: ['fukuoka', 'saga', 'nagasaki', 'kumamoto', 'oita', 'miyazaki', 'kagoshima', 'okinawa'] },
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="都道府県を選択">
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                <p className="text-sm text-gray-500">購入したい都道府県を選択してください。</p>

                {regions.map(region => (
                    <div key={region.name}>
                        <h4 className="font-bold text-gray-700 mb-2 border-b pb-1 text-sm">{region.name}</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {region.ids.map(id => {
                                const land = prefectures.find(l => l.id === id);
                                if (!land) return null;

                                const isOwned = !!land.ownerId;
                                const canAfford = currentBalance >= land.price;

                                return (
                                    <button
                                        key={id}
                                        onClick={() => !isOwned && onSelect(land)}
                                        disabled={isOwned}
                                        className={`p-2 text-xs rounded border transition-all flex flex-col items-center justify-center text-center
                                            ${isOwned
                                                ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'bg-white border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 text-gray-700'}
                                        `}
                                    >
                                        <span className="font-bold">{land.address}</span>
                                        <span className={`text-[10px] ${canAfford ? 'text-indigo-600' : 'text-red-500'}`}>
                                            {isOwned ? '所有済' : `${(land.price / 10000).toLocaleString()}万枚`}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-6 pt-4 border-t flex justify-end">
                <Button variant="secondary" onClick={onClose}>
                    キャンセル
                </Button>
            </div>
        </Modal>
    );
};
