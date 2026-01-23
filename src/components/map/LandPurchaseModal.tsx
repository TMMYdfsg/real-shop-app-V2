import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Land } from '@/types';

interface LandPurchaseModalProps {
    land: Land | null;
    isOpen: boolean;
    onClose: () => void;
    onPurchase: (land: Land) => void;
    currentBalance: number;
}

export const LandPurchaseModal: React.FC<LandPurchaseModalProps> = ({
    land,
    isOpen,
    onClose,
    onPurchase,
    currentBalance
}) => {
    if (!land) return null;

    const canAfford = currentBalance >= land.price;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="土地購入手続き">
            <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-bold text-gray-700 mb-2">物件概要</h3>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="text-gray-500">所在地</div>
                        <div className="col-span-2 font-medium">{land.address}</div>

                        <div className="text-gray-500">区画ID</div>
                        <div className="col-span-2 font-mono">{land.id}</div>

                        <div className="text-gray-500">価格</div>
                        <div className="col-span-2 font-bold text-lg text-indigo-600">
                            {land.price.toLocaleString()}枚
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span className="text-gray-600">現在の所持金</span>
                    <span className={`font-bold ${canAfford ? 'text-green-600' : 'text-red-500'}`}>
                        {currentBalance.toLocaleString()}枚
                    </span>
                </div>

                {!canAfford && (
                    <p className="text-red-500 text-sm text-center font-bold">
                        資金が不足しています！
                    </p>
                )}

                <div className="flex gap-3 pt-2">
                    <Button variant="secondary" onClick={onClose} fullWidth>
                        キャンセル
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => onPurchase(land)}
                        disabled={!canAfford}
                        fullWidth
                    >
                        購入する
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
