import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: string;
    color?: 'blue' | 'green' | 'amber' | 'red' | 'purple';
}

const colorMap = {
    blue: 'from-primary-500 to-primary-700',
    green: 'from-emerald-500 to-emerald-700',
    amber: 'from-amber-500 to-amber-700',
    red: 'from-red-500 to-red-700',
    purple: 'from-purple-500 to-purple-700',
};

const bgColorMap = {
    blue: 'bg-primary-50 text-primary-600',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
};

export default function StatCard({
    title,
    value,
    icon,
    trend,
    color = 'blue',
}: StatCardProps) {
    return (
        <div className="card p-5 animate-fade-in group hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm text-surface-500 font-medium">{title}</p>
                    <p className="text-2xl font-bold text-surface-900 mt-1">{value}</p>
                    {trend && (
                        <p className="text-xs text-surface-500 mt-1">{trend}</p>
                    )}
                </div>
                <div
                    className={`w-12 h-12 rounded-xl ${bgColorMap[color]} flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm`}
                >
                    {icon}
                </div>
            </div>
            <div className={`h-1 rounded-full bg-gradient-to-r ${colorMap[color]} mt-4 opacity-40 group-hover:opacity-100 transition-opacity`} />
        </div>
    );
}
