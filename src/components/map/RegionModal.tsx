import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Land } from '@/types';

interface RegionModalProps {
    isOpen: boolean;
    onClose: () => void;
    regionName: string;
    countries: Land[];
    onSelect: (land: Land) => void;
    currentBalance: number;
}

export const RegionModal: React.FC<RegionModalProps> = ({
    isOpen,
    onClose,
    regionName,
    countries,
    onSelect,
    currentBalance
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`${regionName}の国を選択`}>
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                <p className="text-sm text-gray-500">
                    詳細を確認または購入したい国を選択してください。
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {countries.sort((a, b) => a.address.localeCompare(b.address)).map(land => {
                        const isOwned = !!land.ownerId;
                        const canAfford = currentBalance >= land.price;

                        return (
                            <button
                                key={land.id}
                                onClick={() => onSelect(land)}
                                className={`p-3 text-xs rounded border transition-all flex flex-col items-center justify-center text-center
                                    ${isOwned
                                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                                        : 'bg-white border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 text-gray-700'}
                                `}
                            >
                                <span className="font-bold mb-1">{land.address}</span>
                                <span className={`text-[10px] ${isOwned ? 'text-blue-500' : (canAfford ? 'text-indigo-600' : 'text-red-500')}`}>
                                    {isOwned ? '所有済' : `¥${(land.price / 10000).toLocaleString()}万`}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
            <div className="mt-6 pt-4 border-t flex justify-end">
                <Button variant="secondary" onClick={onClose}>
                    閉じる
                </Button>
            </div>
        </Modal>
    );
};
