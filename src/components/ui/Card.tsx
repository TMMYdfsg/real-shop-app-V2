import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    title?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    id?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', style, title, padding = 'md', id }) => {
    const paddingMap = {
        none: 0,
        sm: '0.5rem',
        md: '1.5rem',
        lg: '2rem',
    };

    return (
        <div
            id={id}
            className={`glass-panel ${className}`}
            style={{
                padding: paddingMap[padding],
                marginBottom: '1rem',
                ...style
            }}
        >
            {title && (
                <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', opacity: 0.9 }}>
                    {title}
                </h3>
            )}
            {children}
        </div>
    );
};
