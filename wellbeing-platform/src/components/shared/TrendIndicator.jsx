import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

const trendConfig = {
  improving: { icon: TrendingDown, color: 'text-emerald-600', label: 'Improving' },
  stable: { icon: Minus, color: 'text-muted-foreground', label: 'Stable' },
  worsening: { icon: TrendingUp, color: 'text-rose-600', label: 'Worsening' },
};

export default function TrendIndicator({ trend, showLabel = true }) {
  const t = trendConfig[trend] || trendConfig.stable;
  const Icon = t.icon;
  return (
    <span className={cn("inline-flex items-center gap-1", t.color)}>
      <Icon className="w-3.5 h-3.5" />
      {showLabel && <span className="text-xs font-medium">{t.label}</span>}
    </span>
  );
}