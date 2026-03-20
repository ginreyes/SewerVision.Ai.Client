'use client';

export default function SectionHeader({ icon: Icon, title, description, variant = 'default' }) {
    const isRose = variant === 'rose';
    return (
        <div className="flex items-center space-x-4 mb-6">
            <div className={`p-2 rounded-lg ${isRose ? 'bg-rose-100' : 'bg-indigo-100'}`}>
                <Icon className={`w-6 h-6 ${isRose ? 'text-rose-600' : 'text-indigo-600'}`} />
            </div>
            <div>
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                <p className="text-sm text-gray-500">{description}</p>
            </div>
        </div>
    );
}
