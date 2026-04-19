import { Box, Paper, Typography, Skeleton } from '@mui/material';

/**
 * Carte KPI réutilisable pour les dashboards USER et ADMIN
 * @param {string} title - Libellé (ex: "Total Factures")
 * @param {string|number} value - Valeur affichée (ex: "42" ou "125 400 MAD")
 * @param {React.ReactNode} icon - Composant MUI Icon
 * @param {string} color - Couleur d'accent (ex: "#F0B429")
 * @param {{ value: number, label: string }} [trend] - Optionnel (ex: { value: 12, label: "+12% ce mois" })
 * @param {boolean} [loading] - Affiche un skeleton pendant le chargement
 */
function KPICard({ title, value, icon, color, trend, loading = false }) {
  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: '16px',
          border: '1px solid rgba(10,15,44,0.08)',
          boxShadow: '0 4px 24px rgba(10,15,44,0.06)',
          minHeight: 120,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Skeleton variant="circular" width={48} height={48} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={36} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="40%" height={24} />
          </Box>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: '16px',
        border: '1px solid rgba(10,15,44,0.06)',
        boxShadow: '0 4px 20px rgba(10,15,44,0.04)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        backgroundColor: '#fff',
        '&:hover': {
          boxShadow: '0 16px 40px rgba(10,15,44,0.1)',
          transform: 'translateY(-4px)',
          borderColor: color ? `${color}40` : 'rgba(10,15,44,0.15)',
        },
      }}
    >
      {/* Premium subtle gradient background on hover */}
      <Box
        sx={{
          position: 'absolute', top: -40, right: -40,
          width: 140, height: 140, borderRadius: '50%',
          background: color ? `radial-gradient(circle, ${color}20 0%, transparent 70%)` : 'none',
          pointerEvents: 'none',
          transition: 'transform 0.5s ease',
          '.MuiPaper-root:hover &': {
            transform: 'scale(1.2)',
          }
        }}
      />
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            backgroundColor: color ? `${color}20` : 'rgba(240,180,41,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Box
            component="span"
            sx={{
              color: color || '#F0B429',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '& .MuiSvgIcon-root': { fontSize: 24, color: 'inherit' },
            }}
          >
            {icon}
          </Box>
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: '#0A0F2C',
              lineHeight: 1.2,
            }}
          >
            {value ?? '—'}
          </Typography>
          <Typography
            sx={{
              fontSize: '0.875rem',
              color: '#6B7280',
              mt: 0.5,
              fontWeight: 500,
            }}
          >
            {title}
          </Typography>
          {trend && (
            <Typography
              sx={{
                fontSize: '0.75rem',
                color: trend.value >= 0 ? '#059669' : '#dc2626',
                mt: 1,
                fontWeight: 600,
              }}
            >
              {trend.label}
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
}

export default KPICard;
