import { Box, Typography, Skeleton } from '@mui/material';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
} from 'recharts';

const NAVY = '#0A0F2C';
const GOLD = '#F0B429';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{
      background: NAVY,
      borderRadius: '10px',
      px: 2, py: 1.4,
      boxShadow: '0 8px 24px rgba(10,15,44,0.25)',
    }}>
      <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', mb: 0.3 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: GOLD }}>
        {payload[0].value} facture{payload[0].value !== 1 ? 's' : ''}
      </Typography>
    </Box>
  );
}

function InvoicesLineChart({ data = [], loading = false }) {
  const maxVal = Math.max(...data.map((d) => d.count), 0);
  const avg = data.length > 0
    ? Math.round(data.reduce((s, d) => s + d.count, 0) / data.length)
    : 0;

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
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography sx={{ fontWeight: 700, color: NAVY, fontSize: '1rem', lineHeight: 1.3 }}>
            Évolution des factures
          </Typography>
          <Typography sx={{ fontSize: '0.78rem', color: '#8A94A6', mt: 0.3 }}>
            Nombre de factures créées par mois — 12 derniers mois
          </Typography>
        </Box>
        {maxVal > 0 && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.7rem', color: '#8A94A6' }}>Pic</Typography>
              <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: NAVY }}>{maxVal}</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.7rem', color: '#8A94A6' }}>Moyenne</Typography>
              <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: NAVY }}>{avg}</Typography>
            </Box>
          </Box>
        )}
      </Box>

      {loading ? (
        <Skeleton variant="rectangular" height={240} sx={{ borderRadius: '10px', flex: 1 }} />
      ) : (
        <Box sx={{ flex: 1, minHeight: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={NAVY} stopOpacity={0.15} />
                <stop offset="95%" stopColor={NAVY} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(10,15,44,0.06)" vertical={false} />
            <XAxis
              dataKey="mois"
              tick={{ fontSize: 11, fill: '#8A94A6' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: '#8A94A6' }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(10,15,44,0.1)', strokeWidth: 1, strokeDasharray: '4 2' }} />
            {avg > 0 && (
              <ReferenceLine
                y={avg}
                stroke={GOLD}
                strokeDasharray="5 3"
                strokeWidth={1.5}
                label={{ value: 'moy.', position: 'insideTopRight', fontSize: 10, fill: GOLD }}
              />
            )}
            <Area
              type="monotone"
              dataKey="count"
              stroke={NAVY}
              strokeWidth={2.5}
              fill="url(#lineGradient)"
              dot={{ r: 4, fill: '#fff', stroke: NAVY, strokeWidth: 2 }}
              activeDot={{ r: 6, fill: NAVY, stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
        </Box>
      )}
    </Box>
  );
}

export default InvoicesLineChart;
