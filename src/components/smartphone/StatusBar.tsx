import React, { useState, useEffect } from 'react';

export const StatusBar = ({ variant = 'light' }: { variant?: 'light' | 'dark' }) => {
    const [time, setTime] = useState('');

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setTime(now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }));
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    const textColor = variant === 'light' ? 'text-white' : 'text-black';

    return (
        <div className={`absolute top-0 left-0 right-0 h-12 px-6 flex justify-between items-center z-40 text-xs font-semibold tracking-wide select-none ${textColor}`}>
            {/* Time */}
            <div className="w-20 pt-2">
                <span>{time}</span>
            </div>

            {/* Icons */}
            <div className="flex items-center gap-1.5 pt-2">
                {/* Signal */}
                <div className="flex items-end gap-[1px] h-3">
                    <div className={`w-1 h-1.5 ${variant === 'light' ? 'bg-white' : 'bg-black'} opacity-100 rounded-[1px]`} />
                    <div className={`w-1 h-2 ${variant === 'light' ? 'bg-white' : 'bg-black'} opacity-100 rounded-[1px]`} />
                    <div className={`w-1 h-2.5 ${variant === 'light' ? 'bg-white' : 'bg-black'} opacity-100 rounded-[1px]`} />
                    <div className={`w-1 h-3 ${variant === 'light' ? 'bg-white' : 'bg-black'} opacity-40 rounded-[1px]`} />
                </div>
                {/* Wifi */}
                <span style={{ fontSize: '1.1rem' }}>📶</span>
                {/* Battery */}
                <div className={`w-6 h-3 border-[1px] rounded-[3px] flex items-center p-[1px] opacity-90 ${variant === 'light' ? 'border-white' : 'border-black'}`}>
                    <div className={`h-full w-[80%] ${variant === 'light' ? 'bg-white' : 'bg-black'} rounded-[1px]`} />
                </div>
            </div>
        </div>
    );
};
