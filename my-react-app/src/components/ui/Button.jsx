import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ children, onClick, type = 'button', variant = 'primary', className = '', loading = false, disabled = false, icon: Icon }) => {
    const variants = {
        primary: 'bg-primary text-white hover:bg-primary-hover shadow-primary/20',
        secondary: 'bg-white text-text-main-light border border-border-light hover:bg-bg-light shadow-sm',
        danger: 'bg-accent-red text-white hover:bg-accent-red/90 shadow-accent-red/20',
        ghost: 'bg-transparent text-text-muted-light hover:bg-bg-light',
    };

    return (
        <motion.button
            whileHover={!loading && !disabled ? { scale: 1.02, y: -2 } : {}}
            whileTap={!loading && !disabled ? { scale: 0.98 } : {}}
            type={type}
            onClick={onClick}
            disabled={loading || disabled}
            className={`
        px-8 py-4 rounded-radius-button font-bold transition-all duration-300 
        flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${className}
      `}
        >
            {loading ? (
                <div className={`h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin`} />
            ) : (
                <>
                    {Icon && <Icon size={18} className="shrink-0" strokeWidth={2.5} />}
                    <span className="uppercase tracking-widest text-xs font-black">{children}</span>
                </>
            )}
        </motion.button>
    );
};

export default Button;
