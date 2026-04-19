import { Box, Typography, Skeleton } from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const NAVY = '#0A0F2C';


function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const total = d._total || 1;
  const pct = ((d.value / total) * 100).toFixed(1);
  return (
    <Box sx={{
      background: NAVY,
      borderRadius: '10px',
      px: 2, py: 1.4,
      boxShadow: '0 8px 24px rgba(10,15,44,0.25)',
    }}>
      <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', mb: 0.3 }}>
        {d.name}
      </Typography>
      <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
        {d.value} facture{d.value > 1 ? 's' : ''} — {pct}%
      </Typography>
    </Box>
  );
}

function CenterLabel({ cx, cy, total }) {
  return (
    <g>
      <text x={cx} y={cy - 8} textAnchor="middle" fill={NAVY} fontSize={26} fontWeight={700}>
        {total}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="#8A94A6" fontSize={11}>
        factures
      </text>
    </g>
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
      boxShadow: '0 4px 20px rgba(10,15,44,0.06)',
      p: 3,
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
    }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography sx={{ fontWeight: 700, color: NAVY, fontSize: '1rem', lineHeight: 1.3 }}>
          Répartition des statuts
        </Typography>
        <Typography sx={{ fontSize: '0.78rem', color: '#8A94A6', mt: 0.3 }}>
          Distribution des factures par état
        </Typography>
      </Box>

      {loading ? (
        <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto', my: 'auto' }} />
      ) : total === 0 ? (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 220 }}>
          <Typography color="text.secondary" fontSize="0.9rem">Aucune facture</Typography>
        </Box>
      ) : (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 300 }}>
          {/* Donut chart */}
          <Box sx={{ flex: 1, minHeight: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={enriched}
                  cx="50%"
                  cy="50%"
                  innerRadius="52%"
                  outerRadius="75%"
                  dataKey="value"
                  paddingAngle={3}
                  startAngle={90}
                  endAngle={-270}
                >
                  {enriched.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="none" />
                  ))}
                  <CenterLabel cx={0} cy={0} total={total} />
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </Box>

          {/* Légende manuelle */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 2.5,
            flexWrap: 'wrap',
            mt: 1,
            pb: 0.5,
          }}>
            {enriched.map((d) => (
              <Box key={d.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Box sx={{
                  width: 10, height: 10, borderRadius: '50%',
                  backgroundColor: d.color, flexShrink: 0,
                }} />
                <Typography sx={{ fontSize: '0.78rem', color: '#374151', fontWeight: 500 }}>
                  {d.name}
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', color: '#8A94A6', fontWeight: 600 }}>
                  ({d.value})
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default StatusPieChart;
