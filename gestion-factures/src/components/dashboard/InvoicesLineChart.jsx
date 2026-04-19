import { Box, Typography, Skeleton } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

const NAVY = '#0A0F2C';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{
      background: '#fff',
      border: '1px solid rgba(10,15,44,0.10)',
      borderRadius: '10px',
      px: 2, py: 1.2,
      boxShadow: '0 4px 16px rgba(10,15,44,0.12)',
    }}>
      <Typography sx={{ fontSize: '0.78rem', color: '#8A94A6', mb: 0.3 }}>{label}</Typography>
      <Typography sx={{ fontSize: '0.92rem', fontWeight: 700, color: NAVY }}>
        {payload[0].value} facture{payload[0].value > 1 ? 's' : ''}
      </Typography>
    </Box>
  );
}

function InvoicesLineChart({ data = [], loading = false }) {
  return (
    <Box sx={{
      background: '#fff',
      borderRadius: '16px',
      border: '1px solid rgba(10,15,44,0.06)',
      boxShadow: '0 4px 20px rgba(10,15,44,0.04)',
      p: 3,
    }}>
      <Typography sx={{ fontWeight: 700, color: NAVY, fontSize: '1rem', mb: 0.5 }}>
        Évolution des factures
      </Typography>
      <Typography sx={{ fontSize: '0.8rem', color: '#8A94A6', mb: 2.5 }}>
        Nombre de factures créées par mois — 12 derniers mois
      </Typography>

      {loading ? (
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: '10px' }} />
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="invoiceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0A0F2C" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#0A0F2C" stopOpacity={0} />
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
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(10,15,44,0.08)', strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="count"
              stroke={NAVY}
              strokeWidth={2.5}
              fill="url(#invoiceGradient)"
              dot={{ r: 4, fill: NAVY, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: NAVY }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
}

export default InvoicesLineChart;
