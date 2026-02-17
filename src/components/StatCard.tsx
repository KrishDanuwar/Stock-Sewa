import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: string;
    color?: 'blue' | 'green' | 'amber' | 'red' | 'purple';
}

const colorMap = {
    blue: 'from-blue-400 to-blue-600',
    green: 'from-brand-primary to-[#96f000]',
    amber: 'from-amber-400 to-amber-600',
    red: 'from-red-400 to-red-600',
    purple: 'from-purple-400 to-purple-600',
};

const bgColorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
};

export default function StatCard({
    title,
    value,
    icon,
    trend,
    color = 'blue',
}: StatCardProps) {
    return (
        <div className="card p-6 animate-fade-in group hover:border-brand-primary/30 hover:scale-[1.02] transition-all duration-500">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-[10px] text-surface-muted font-black uppercase tracking-widest">{title}</p>
                    <p className="text-2xl font-poppins font-bold text-surface-primary mt-2">{value}</p>
                    {trend && (
                        <p className="text-xs text-surface-muted mt-2 font-medium">{trend}</p>
                    )}
                </div>
                <div
                    className={`w-12 h-12 rounded-2xl ${bgColorMap[color]} border flex items-center justify-center transition-all duration-500 group-hover:shadow-lg group-hover:shadow-brand-primary/5`}
                >
                    {icon}
                </div>
            </div>
            <div className={`h-1.5 rounded-full bg-gradient-to-r ${colorMap[color]} mt-5 opacity-20 group-hover:opacity-100 transition-all duration-700`} />
        </div>
    );
}
