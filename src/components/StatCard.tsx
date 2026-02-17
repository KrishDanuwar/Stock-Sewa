import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: string;
    color?: 'blue' | 'green' | 'amber' | 'red' | 'purple';
}

const colorMap = {
    blue: 'from-status-info/40 to-status-info',
    green: 'from-brand-primary/40 to-brand-primary',
    amber: 'from-status-warning/40 to-status-warning',
    red: 'from-status-danger/40 to-status-danger',
    purple: 'from-purple-500/40 to-purple-700',
};

const bgColorMap = {
    blue: 'bg-status-info/10 text-status-info border-status-info/20',
    green: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20',
    amber: 'bg-status-warning/10 text-status-warning border-status-warning/20',
    red: 'bg-status-danger/10 text-status-danger border-status-danger/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
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
