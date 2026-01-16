import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    className = '',
    style,
    ...props
}) => {
    const baseStyle: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-sm)',
        fontWeight: 600,
        cursor: props.disabled ? 'not-allowed' : 'pointer',
        opacity: props.disabled ? 0.6 : 1,
        transition: 'all 0.2s ease',
        border: 'none',
        outline: 'none',
        width: fullWidth ? '100%' : 'auto',
        ...style
    };

    const variants = {
        primary: {
            background: 'var(--accent-color)',
            color: 'white',
            boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.4)',
        },
        secondary: {
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--glass-border)',
        },
        danger: {
            background: 'var(--danger-color)',
            color: 'white',
        },
        success: {
            background: 'var(--success-color)',
            color: 'white',
        },
        ghost: {
            background: 'transparent',
            color: 'var(--text-secondary)',
        },
    };

    const sizes = {
        sm: { padding: '0.25rem 0.5rem', fontSize: '0.875rem' },
        md: { padding: '0.5rem 1rem', fontSize: '1rem' },
        lg: { padding: '0.75rem 1.5rem', fontSize: '1.125rem' },
    };

    const combinedStyle = {
        ...baseStyle,
        ...variants[variant],
        ...sizes[size],
    };

    return (
        <button
            className={`btn-${variant} ${className}`}
            style={combinedStyle}
            {...props}
            onMouseEnter={(e) => {
                if (!props.disabled && variant !== 'ghost') {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.filter = 'brightness(1.1)';
                }
            }}
            onMouseLeave={(e) => {
                if (!props.disabled && variant !== 'ghost') {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.filter = 'brightness(1)';
                }
            }}
        >
            {children}
        </button>
    );
};
