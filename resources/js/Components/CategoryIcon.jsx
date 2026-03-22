import * as LucideIcons from 'lucide-react';

const colorMap = {
    indigo:  { bg: 'bg-indigo-100',  text: 'text-indigo-600' },
    sky:     { bg: 'bg-sky-100',     text: 'text-sky-600' },
    violet:  { bg: 'bg-violet-100',  text: 'text-violet-600' },
    amber:   { bg: 'bg-amber-100',   text: 'text-amber-600' },
    stone:   { bg: 'bg-stone-100',   text: 'text-stone-600' },
    yellow:  { bg: 'bg-yellow-100',  text: 'text-yellow-600' },
    orange:  { bg: 'bg-orange-100',  text: 'text-orange-600' },
    green:   { bg: 'bg-green-100',   text: 'text-green-600' },
    teal:    { bg: 'bg-teal-100',    text: 'text-teal-600' },
    cyan:    { bg: 'bg-cyan-100',    text: 'text-cyan-600' },
    blue:    { bg: 'bg-blue-100',    text: 'text-blue-600' },
    slate:   { bg: 'bg-slate-100',   text: 'text-slate-600' },
    pink:    { bg: 'bg-pink-100',    text: 'text-pink-600' },
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
    gray:    { bg: 'bg-gray-100',    text: 'text-gray-600' },
    lime:    { bg: 'bg-lime-100',    text: 'text-lime-600' },
    zinc:    { bg: 'bg-zinc-100',    text: 'text-zinc-600' },
    red:     { bg: 'bg-red-100',     text: 'text-red-600' },
    rose:    { bg: 'bg-rose-100',    text: 'text-rose-600' },
};

export default function CategoryIcon({ icon, color = 'gray', size = 18, className = '' }) {
    const Icon = LucideIcons[icon] ?? LucideIcons.LayoutGrid;
    const { bg, text } = colorMap[color] ?? colorMap.gray;

    return (
        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${bg} ${className}`}>
            <Icon size={size} className={text} strokeWidth={1.75} />
        </span>
    );
}
