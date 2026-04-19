import { Box, Typography, Skeleton } from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const NAVY = '#0A0F2C';

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const total = payload[0].payload._total || 1;
  const pct = ((d.value / total) * 100).toFixed(1);
  return (
    <Box sx={{
      background: '#fff',
      border: '1px solid rgba(10,15,44,0.10)',
      borderRadius: '10px',
      px: 2, py: 1.2,
      boxShadow: '0 4px 16px rgba(10,15,44,0.12)',
    }}>
      <Typography sx={{ fontSize: '0.78rem', color: '#8A94A6', mb: 0.3 }}>{d.name}</Typography>
      <Typography sx={{ fontSize: '0.92rem', fontWeight: 700, color: NAVY }}>
        {d.value} facture{d.value > 1 ? 's' : ''} — {pct}%
      </Typography>
    </Box>
  );
}

function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.06) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
      fontSize={12} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

function StatusPieChart({ data = [], loading = false }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const enriched = data.map((d) => ({ ...d, _total: total }));

  return (
    <Box sx={{
      background: '#fff',
      borderRadius: '16px',
      border: '1px solid rgba(10,15,44,0.06)',
      boxShadow: '0 4px 20px rgba(10,15,44,0.04)',
      p: 3,
      height: '100%',
    }}>
      <Typography sx={{ fontWeight: 700, color: NAVY, fontSize: '1rem', mb: 0.5 }}>
        Répartition des statuts
      </Typography>
      <Typography sx={{ fontSize: '0.8rem', color: '#8A94A6', mb: 2.5 }}>
        Distribution des factures par état
      </Typography>

      {loading ? (
        <Skeleton variant="circular" width={180} height={180} sx={{ mx: 'auto' }} />
      ) : total === 0 ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 220 }}>
          <Typography color="text.secondary" fontSize="0.9rem">Aucune facture</Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={enriched}
              cx="50%"
              cy="45%"
              outerRadius={80}
              dataKey="value"
              labelLine={false}
              label={renderCustomLabel}
            >
              {enriched.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={10}
              formatter={(value) => (
                <span style={{ color: '#374151', fontSize: 12, fontWeight: 500 }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
}

export default StatusPieChart;
