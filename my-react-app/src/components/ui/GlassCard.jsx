import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', delay = 0, hover = false }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: delay }}
            whileHover={hover ? { y: -5, scale: 1.01 } : {}}
            className={`
                backdrop-blur-lg bg-bg-card/70 dark:bg-bg-card-dark/60 
                border border-white/20 dark:border-white/10 
                shadow-premium dark:shadow-black/20 
                rounded-radius-card overflow-hidden 
                transition-all duration-300 ${className}
            `}
        >
            {children}
        </motion.div>
    );
};

export default GlassCard;
