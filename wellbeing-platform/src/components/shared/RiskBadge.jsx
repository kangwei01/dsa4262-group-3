import { cn } from '@/lib/utils';

const config = {
  low: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', label: 'Low' },
  medium: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500', label: 'Medium' },
  high: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500', label: 'High' },
};

export default function RiskBadge({ level, size = 'sm' }) {
  const c = config[level] || config.low;
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border font-medium",
      c.bg, c.text, c.border,
      size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
    )}>
      <span className={cn("w-1.5 h-1.5 rounded-full", c.dot)} />
      {c.label}
    </span>
  );
}