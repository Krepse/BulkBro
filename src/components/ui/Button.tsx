import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'slate' | 'danger' | 'success' | 'glass';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
}

export function Button({
    children,
    variant = 'primary',
    size = 'lg',
    className = '',
    isLoading,
    ...props
}: ButtonProps) {

    const baseStyles = "font-bold rounded-full transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-900/50 border border-white/10",
        secondary: "bg-white hover:bg-indigo-50 text-indigo-600 border-2 border-indigo-100 hover:border-indigo-200 shadow-sm",
        slate: "bg-slate-800 hover:bg-slate-700 text-white shadow-xl shadow-slate-900/50 border border-white/10",
        danger: "bg-red-50 hover:bg-red-100 text-red-500 border border-red-100",
        success: "bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-200",
        glass: "bg-white/10 hover:bg-white/20 text-white shadow-sm border border-white/10 backdrop-blur-md"
    };

    const sizes = {
        sm: "py-2 px-4 text-xs",
        md: "py-4 px-6 text-sm",
        lg: "py-6 px-8 text-lg",
        icon: "w-12 h-12 p-0"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : children}
        </button>
    );
}
