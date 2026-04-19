import {
  Box, Typography, Grid, Paper,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Button, Skeleton
} from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleIcon from '@mui/icons-material/People';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CancelIcon from '@mui/icons-material/Cancel';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useInvoices } from '../../hooks/useInvoices';
import { useClients } from '../../hooks/useClients';
import { getAdminStats } from '../../utils/dashboardStats';
import { formatCurrency } from '../../utils/calculations';
import KPICard from '../../components/dashboard/KPICard';
import MonthlyRevenueChart from '../../components/dashboard/MonthlyRevenueChart';
import StatusPieChart from '../../components/dashboard/StatusPieChart';
import InvoicesLineChart from '../../components/dashboard/InvoicesLineChart';
import { useNavigate } from 'react-router-dom';

const STATUT_CONFIG = {
  EN_ATTENTE: { label: 'En attente', color: '#D97706', bg: 'rgba(217,119,6,0.15)' },
  PAYEE:      { label: 'Payée',      color: '#059669', bg: 'rgba(5,150,105,0.15)'  },
  REJETEE:    { label: 'Rejetée',    color: '#dc2626', bg: 'rgba(220,38,38,0.15)'  },
};

function AdminDashboard() {
  const navigate = useNavigate();
  const { factures, loading: loadingFactures } = useInvoices(null);
  const { clients, loading: loadingClients } = useClients();

  const stats = getAdminStats(factures, clients);
  const loading = loadingFactures || loadingClients;

  const clientMap = Object.fromEntries((clients || []).map((c) => [c.id, c]));
  const getClientName = (clientId) => clientMap[clientId]?.nom ?? '—';

  return (
    <Box sx={{ p: 3, width: '100%', boxSizing: 'border-box' }}>

      {/* En-tête */}
      <Box sx={{
        background: 'linear-gradient(135deg, #0A0F2C 0%, #141c3f 100%)',
        borderRadius: '16px',
        px: 4, py: 3, mb: 4,
        display: 'flex', alignItems: 'center', gap: 2,
        boxShadow: '0 8px 32px rgba(10,15,44,0.18)',
        position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{
          position: 'absolute', top: -40, right: -40,
          width: 180, height: 180, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(240,180,41,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <Box sx={{
          width: 48, height: 48, borderRadius: '12px',
          background: 'linear-gradient(135deg, #F0B429 0%, #FFD95A 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <AdminPanelSettingsIcon sx={{ color: '#0A0F2C', fontSize: 24 }} />
        </Box>
        <Box>
          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.4rem', lineHeight: 1.2 }}>
            Dashboard Administrateur
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', mt: 0.3 }}>
            Vue globale des performances et validation des factures
          </Typography>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2}>
        {[
          { title: 'Total Factures', value: stats.total_factures,                 icon: <ReceiptLongIcon />, color: '#F0B429' },
          { title: 'Total Encaissé', value: formatCurrency(stats.total_encaisse),  icon: <AttachMoneyIcon />, color: '#059669' },
          { title: 'Total Clients',  value: stats.total_clients,                  icon: <PeopleIcon />,      color: '#0A0F2C' },
          { title: 'En attente',     value: stats.factures_en_attente,            icon: <ScheduleIcon />,    color: '#D97706' },
          { title: 'Rejetées',       value: stats.factures_rejetees,              icon: <CancelIcon />,      color: '#dc2626' },
          { title: 'Montant moyen',  value: formatCurrency(stats.montant_moyen),  icon: <TrendingUpIcon />,  color: '#6366f1' },
        ].map((kpi) => (
          <Grid item xs={12} sm={6} md={4} key={kpi.title}>
            <KPICard {...kpi} loading={loading} />
          </Grid>
        ))}
      </Grid>

      {/* Graphiques — 3 colonnes strictement égales (1/3 chacune) */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 2,
        mt: 1,
        width: '100%',
      }}>
        <MonthlyRevenueChart data={stats.ca_mensuel} loading={loading} />
        <StatusPieChart data={stats.repartition_statuts} loading={loading} />
        <InvoicesLineChart data={stats.factures_par_mois} loading={loading} />
      </Box>

      {/* Table factures en attente */}
      <Paper elevation={0} sx={{
        p: 4, mt: 2,
        borderRadius: '16px',
        border: '1px solid rgba(10,15,44,0.06)',
        boxShadow: '0 4px 20px rgba(10,15,44,0.04)',
        '&:hover': { boxShadow: '0 12px 32px rgba(10,15,44,0.08)' },
      }}>
        <Typography sx={{ fontWeight: 700, color: '#0A0F2C', mb: 2, fontSize: '1.1rem' }}>
          Factures en attente de validation
        </Typography>
        {loading ? (
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: '10px' }} />
        ) : stats.recent_factures_en_attente?.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 3 }}>
            Aucune facture en attente.
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'rgba(10,15,44,0.04)' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Numéro</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Client</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Total TTC</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.recent_factures_en_attente?.map((f) => {
                  const cfg = STATUT_CONFIG[f.statut] ?? STATUT_CONFIG.EN_ATTENTE;
                  return (
                    <TableRow key={f.id} hover sx={{ cursor: 'pointer' }}
                      onClick={() => navigate('/admin/validation')}>
                      <TableCell sx={{ fontWeight: 500 }}>{f.numero ?? '—'}</TableCell>
                      <TableCell>{getClientName(f.client_id)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {formatCurrency(f.total_ttc)}
                      </TableCell>
                      <TableCell>
                        <Chip label={cfg.label} size="small"
                          sx={{ backgroundColor: cfg.bg, color: cfg.color, fontWeight: 600 }} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <Button endIcon={<ArrowForwardIcon />} onClick={() => navigate('/admin/validation')}
          sx={{ mt: 2, color: '#F0B429', fontWeight: 600,
            '&:hover': { backgroundColor: 'rgba(240,180,41,0.08)' } }}>
          Aller à la validation
        </Button>
      </Paper>
    </Box>
  );
}

export default AdminDashboard;