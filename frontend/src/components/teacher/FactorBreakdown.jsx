import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Moon, BookOpen, Smile, Users } from 'lucide-react';

const factorMeta = {
  sleep: { label: 'Sleep', icon: Moon, color: '#6366f1' },
  stress: { label: 'School Pressure', icon: BookOpen, color: '#f59e0b' },
  mood: { label: 'Mood', icon: Smile, color: '#10b981' },
  social: { label: 'Social Connection', icon: Users, color: '#ec4899' },
};

export default function FactorBreakdown({ weeklyScores }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {Object.entries(factorMeta).map(([key, meta]) => {
        const Icon = meta.icon;
        const latest = weeklyScores[weeklyScores.length - 1]?.[key] || 0;
        const first = weeklyScores[0]?.[key] || 0;
        const diff = latest - first;
        return (
          <div key={key} className="p-3 rounded-xl bg-secondary/50 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
              <span className="text-xs font-medium text-foreground">{meta.label}</span>
              <span className={`text-[10px] ml-auto font-medium ${diff > 0 ? 'text-emerald-600' : diff < 0 ? 'text-rose-600' : 'text-muted-foreground'}`}>
                {diff > 0 ? '↑' : diff < 0 ? '↓' : '→'} {Math.abs(diff)}
              </span>
            </div>
            <div className="h-12">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyScores}>
                  <Line type="monotone" dataKey={key} stroke={meta.color} strokeWidth={2} dot={false} />
                  <XAxis dataKey="week" hide />
                  <Tooltip contentStyle={{ fontSize: 10, borderRadius: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })}
    </div>
  );
}