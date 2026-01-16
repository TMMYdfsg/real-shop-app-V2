'use client';

import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Modal } from './Modal';
import { Button } from './Button';

interface QRScannerProps {
    isOpen: boolean;
    onClose: () => void;
    onScan: (decodedText: string) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ isOpen, onClose, onScan }) => {
    const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        if (isOpen && !scanner) {
            const qrScanner = new Html5QrcodeScanner(
                'qr-reader',
                { fps: 10, qrbox: { width: 250, height: 250 } },
                false
            );

            qrScanner.render(
                (decodedText) => {
                    onScan(decodedText);
                    qrScanner.clear();
                    onClose();
                },
                (error) => {
                    // エラーハンドリング（スキャン失敗は頻繁に起きるので無視）
                }
            );

            setScanner(qrScanner);
        }

        return () => {
            if (scanner) {
                scanner.clear().catch(() => { });
            }
        };
    }, [isOpen]);

    const handleClose = () => {
        if (scanner) {
            scanner.clear().catch(() => { });
            setScanner(null);
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="QRコードをスキャン">
            <div style={{ padding: '1rem' }}>
                <div id="qr-reader" style={{ width: '100%' }}></div>
                <Button onClick={handleClose} fullWidth style={{ marginTop: '1rem' }}>
                    キャンセル
                </Button>
            </div>
        </Modal>
    );
};
