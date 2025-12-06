import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <div
            onClick={toggleTheme}
            className={`relative w-16 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-500 ${theme === 'light' ? 'bg-gray-300' : 'bg-gray-800 border border-gray-700'}`}
        >
            <motion.div
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={`w-6 h-6 rounded-full shadow-md flex items-center justify-center z-10 ${theme === 'light' ? 'bg-white' : 'bg-brand-green'}`}
                style={{
                    position: 'absolute',
                    left: theme === 'light' ? 'calc(100% - 1.75rem)' : '0.25rem'
                }}
            >
                {theme === 'light' ? (
                    <Sun size={14} className="text-yellow-500" />
                ) : (
                    <Moon size={14} className="text-black" />
                )}
            </motion.div>
        </div>
    );
}
