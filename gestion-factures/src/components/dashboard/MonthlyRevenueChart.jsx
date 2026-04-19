import { Box, Typography, Skeleton } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const NAVY = '#0A0F2C';
const GOLD = '#F0B429';
const GOLD_LIGHT = '#FFD95A';

function formatMAD(value) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return String(value);
}

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
        {Number(payload[0].value).toLocaleString('fr-FR', {
          style: 'currency', currency: 'MAD', minimumFractionDigits: 0,
        })}
      </Typography>
    </Box>
  );
}

function MonthlyRevenueChart({ data = [], loading = false }) {
  const maxVal = Math.max(...data.map((d) => d.montant), 1);

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
          Chiffre d'affaires mensuel
        </Typography>
        <Typography sx={{ fontSize: '0.78rem', color: '#8A94A6', mt: 0.3 }}>
          Factures payées — 12 derniers mois
        </Typography>
      </Box>

      {loading ? (
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: '10px', flex: 1 }} />
      ) : (
        <Box sx={{ flex: 1, minHeight: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              barCategoryGap="40%"
            >
              <defs>
                <linearGradient id="barGold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={GOLD_LIGHT} stopOpacity={1} />
                  <stop offset="100%" stopColor={GOLD} stopOpacity={1} />
                </linearGradient>
                <linearGradient id="barGoldDim" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={GOLD} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={GOLD} stopOpacity={0.2} />
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
                tickFormatter={formatMAD}
                tick={{ fontSize: 11, fill: '#8A94A6' }}
                axisLine={false}
                tickLine={false}
                width={44}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(240,180,41,0.07)', borderRadius: 6 }} />
              <Bar dataKey="montant" radius={[6, 6, 0, 0]} maxBarSize={40}>
                {data.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.montant === maxVal && entry.montant > 0 ? 'url(#barGold)' : 'url(#barGoldDim)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Box>
  );
}

export default MonthlyRevenueChart;
