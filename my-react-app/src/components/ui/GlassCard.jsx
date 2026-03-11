import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', delay = 0, hover = false }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: delay }}
            whileHover={hover ? { y: -2 } : {}}
            className={`
                bg-white dark:bg-slate-900 
                border border-slate-200 dark:border-slate-800 
                shadow-sm dark:shadow-none 
                rounded-radius-card overflow-hidden 
                transition-all duration-200 ${className}
            `}
        >
            {children}
        </motion.div>
    );
};

export default GlassCard;
