import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Skeleton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useAuth } from '../../contexts/AuthContext';
import { useInvoices } from '../../hooks/useInvoices';
import { useClients } from '../../hooks/useClients';
import { getUserStats } from '../../utils/dashboardStats';
import { formatCurrency } from '../../utils/calculations';
import KPICard from '../../components/dashboard/KPICard';

const NAVY = '#0A0F2C';
const GOLD = '#F0B429';

const STATUT_CONFIG = {
  EN_ATTENTE: { label: 'En attente', color: '#D97706', bg: 'rgba(217,119,6,0.15)' },
  PAYEE: { label: 'Payée', color: '#059669', bg: 'rgba(5,150,105,0.15)' },
  REJETEE: { label: 'Rejetée', color: '#dc2626', bg: 'rgba(220,38,38,0.15)' },
};

function UserDashboard() {
  const navigate = useNavigate();
  const { currentUser, userRole } = useAuth();
  const isAdmin = userRole === 'admin';
  const { factures, loading } = useInvoices(isAdmin ? null : currentUser?.uid);
  const { clients } = useClients(isAdmin ? null : currentUser?.uid);

  const stats = getUserStats(factures, isAdmin ? null : currentUser?.uid);
  const clientMap = useMemo(
    () => Object.fromEntries((clients || []).map((c) => [c.id, c])),
    [clients]
  );
  const getClientName = (clientId) => clientMap[clientId]?.nom ?? '—';

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: NAVY }}>
          Bonjour, {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Utilisateur'} !
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/factures/nouvelle')}
            sx={{
              backgroundColor: GOLD,
              color: NAVY,
              fontWeight: 600,
              borderRadius: '10px',
              '&:hover': { backgroundColor: '#FFD95A' },
            }}
          >
            Nouvelle facture
          </Button>
          <Button
            variant="outlined"
            startIcon={<PersonAddIcon />}
            onClick={() => navigate('/clients')}
            sx={{ fontWeight: 600, borderRadius: '10px' }}
          >
            Nouveau client
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <KPICard
            title="Total Factures"
            value={stats.total_factures}
            icon={<ReceiptLongIcon />}
            color="#F0B429"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <KPICard
            title="En attente"
            value={stats.factures_en_attente}
            icon={<ScheduleIcon />}
            color="#D97706"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <KPICard
            title="Payées"
            value={stats.factures_payees}
            icon={<CheckCircleIcon />}
            color="#059669"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <KPICard
            title="Total Émis"
            value={formatCurrency(stats.total_emis)}
            icon={<AttachMoneyIcon />}
            color="#0A0F2C"
            loading={loading}
          />
        </Grid>
      </Grid>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: '16px',
          border: '1px solid rgba(10,15,44,0.08)',
          boxShadow: '0 4px 24px rgba(10,15,44,0.06)',
        }}
      >
        <Typography sx={{ fontWeight: 700, color: NAVY, mb: 2, fontSize: '1.1rem' }}>
          {isAdmin ? 'Dernières factures' : 'Mes dernières factures'}
        </Typography>
        {loading ? (
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: '10px' }} />
        ) : stats.recent_factures.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 3 }}>
            Aucune facture pour le moment.
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
                {stats.recent_factures.map((f) => {
                  const statutCfg = STATUT_CONFIG[f.statut] ?? STATUT_CONFIG.EN_ATTENTE;
                  return (
                    <TableRow
                      key={f.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/factures/${f.id}`)}
                    >
                      <TableCell sx={{ fontWeight: 500 }}>{f.numero ?? '—'}</TableCell>
                      <TableCell>{getClientName(f.client_id)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {formatCurrency(f.total_ttc)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={statutCfg.label}
                          size="small"
                          sx={{
                            backgroundColor: statutCfg.bg,
                            color: statutCfg.color,
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <Button
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigate('/factures')}
          sx={{
            mt: 2,
            color: GOLD,
            fontWeight: 600,
            '&:hover': { backgroundColor: 'rgba(240,180,41,0.08)' },
          }}
        >
          Voir toutes
        </Button>
      </Paper>
    </Box>
  );
}

export default UserDashboard;