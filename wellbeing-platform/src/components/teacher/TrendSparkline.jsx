import { Line, LineChart, ResponsiveContainer } from 'recharts';
import { DISTRESS_THRESHOLD, HIGH_DISTRESS_THRESHOLD } from '@/lib/rfModel';

export default function TrendSparkline({ weeklyScores, className = 'w-24 h-10' }) {
  const latest = weeklyScores[weeklyScores.length - 1]?.score || 0;
  const stroke =
    latest >= HIGH_DISTRESS_THRESHOLD ? '#dc2626'
      : latest >= DISTRESS_THRESHOLD ? '#d97706'
        : '#059669';

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={weeklyScores}>
          <Line
            type="monotone"
            dataKey="score"
            stroke={stroke}
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
