import { Box, Typography, Skeleton } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const NAVY = '#0A0F2C';
const GOLD = '#F0B429';

function formatMAD(value) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
  return String(value);
}

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
        {Number(payload[0].value).toLocaleString('fr-FR', { style: 'currency', currency: 'MAD', minimumFractionDigits: 0 })}
      </Typography>
    </Box>
  );
}

function MonthlyRevenueChart({ data = [], loading = false }) {
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
        Chiffre d'affaires mensuel
      </Typography>
      <Typography sx={{ fontSize: '0.8rem', color: '#8A94A6', mb: 2.5 }}>
        Factures payées — 12 derniers mois
      </Typography>

      {loading ? (
        <Skeleton variant="rectangular" height={220} sx={{ borderRadius: '10px' }} />
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barCategoryGap="35%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(10,15,44,0.06)" vertical={false} />
            <XAxis
              dataKey="mois"
              tick={{ fontSize: 11, fill: '#8A94A6' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatMAD}
              tick={{ fontSize: 11, fill: '#8A94A6' }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(240,180,41,0.06)' }} />
            <Bar
              dataKey="montant"
              fill={GOLD}
              radius={[6, 6, 0, 0]}
              maxBarSize={36}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
}

export default MonthlyRevenueChart;
