interface StatCardProps {
    title: string;
    value: string | number;
    icon: string;
    trend?: string;
    color?: 'blue' | 'green' | 'amber' | 'red';
}

const colorMap = {
    blue: 'from-primary-500 to-primary-700',
    green: 'from-emerald-500 to-emerald-700',
    amber: 'from-amber-500 to-amber-700',
    red: 'from-red-500 to-red-700',
};

const bgColorMap = {
    blue: 'bg-primary-50',
    green: 'bg-emerald-50',
    amber: 'bg-amber-50',
    red: 'bg-red-50',
};

export default function StatCard({
    title,
    value,
    icon,
    trend,
    color = 'blue',
}: StatCardProps) {
    return (
        <div className="card p-5 animate-fade-in">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm text-surface-500 font-medium">{title}</p>
                    <p className="text-2xl font-bold text-surface-900 mt-1">{value}</p>
                    {trend && (
                        <p className="text-xs text-surface-500 mt-1">{trend}</p>
                    )}
                </div>
                <div
                    className={`w-11 h-11 rounded-xl ${bgColorMap[color]} flex items-center justify-center`}
                >
                    <span className="text-xl">{icon}</span>
                </div>
            </div>
            <div className={`h-1 rounded-full bg-gradient-to-r ${colorMap[color]} mt-4 opacity-60`} />
        </div>
    );
}
