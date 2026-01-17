import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' | 'outline';
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
    const baseStyle = {
        display: 'inline-flex' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        borderRadius: 'var(--radius-sm)',
        fontWeight: 600 as const,
        cursor: props.disabled ? 'not-allowed' as const : 'pointer' as const,
        opacity: props.disabled ? 0.6 : 1,
        border: 'none',
        outline: 'none',
        width: fullWidth ? '100%' : 'auto',
    };

    const variantsMap = {
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
        outline: {
            background: 'transparent',
            color: 'var(--primary-color)',
            border: '1px solid var(--primary-color)',
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
        ...variantsMap[variant],
        ...sizes[size],
        ...style
    };

    return (
        <motion.button
            className={`btn-${variant} ${className}`}
            style={combinedStyle}
            whileHover={!props.disabled ? { scale: 1.05, filter: 'brightness(1.1)' } : {}}
            whileTap={!props.disabled ? { scale: 0.95 } : {}}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            {...props}
        >
            {children}
        </motion.button>
    );
};
