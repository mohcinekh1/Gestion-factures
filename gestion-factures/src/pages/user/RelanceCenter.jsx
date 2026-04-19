import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Paper, Chip, Button, Skeleton,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TextField, InputAdornment, Tooltip, Divider,
  ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useInvoices } from '../../hooks/useInvoices';
import { useClients } from '../../hooks/useClients';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/calculations';
import {
  buildRelanceList,
  getRelanceStats,
  PRIORITE_CONFIG,
} from '../../utils/relanceUtils';

const NAVY = '#0A0F2C';
const GOLD = '#F0B429';

function KPIRelance({ label, value, color, icon, loading }) {
  if (loading) return <Skeleton variant="rectangular" height={90} sx={{ borderRadius: '14px' }} />;
  return (
    <Paper elevation={0} sx={{
      p: 2.5, borderRadius: '14px',
      border: `1px solid ${color}30`,
      background: `${color}08`,
      display: 'flex', alignItems: 'center', gap: 2,
    }}>
      <Box sx={{
        width: 44, height: 44, borderRadius: '10px',
        background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Box sx={{ color, display: 'flex' }}>{icon}</Box>
      </Box>
      <Box>
        <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: NAVY, lineHeight: 1 }}>
          {value}
        </Typography>
        <Typography sx={{ fontSize: '0.78rem', color: '#8A94A6', mt: 0.3 }}>
          {label}
        </Typography>
      </Box>
    </Paper>
  );
}

function RetardBar({ retard }) {
  const max = 90;
  const pct = Math.min(100, (retard / max) * 100);
  const color = retard > 60 ? '#dc2626' : retard > 30 ? '#ea580c' : retard > 0 ? '#d97706' : '#059669';
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120 }}>
      <Box sx={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: 'rgba(10,15,44,0.08)', overflow: 'hidden' }}>
        <Box sx={{ width: `${pct}%`, height: '100%', borderRadius: 3, backgroundColor: color, transition: 'width 0.6s ease' }} />
      </Box>
      <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color, minWidth: 28, textAlign: 'right' }}>
        {retard > 0 ? `+${retard}j` : '—'}
      </Typography>
    </Box>
  );
}

function RelanceCenter() {
  const navigate = useNavigate();
  const { currentUser, userRole } = useAuth();
  const isAdmin = userRole === 'admin';

  const { factures, loading: loadingF } = useInvoices(isAdmin ? null : currentUser?.uid);
  const { clients, loading: loadingC } = useClients(isAdmin ? null : currentUser?.uid);
  const loading = loadingF || loadingC;

  const [search, setSearch] = useState('');
  const [filtrePriorite, setFiltrePriorite] = useState('tous');

  const clientMap = useMemo(
    () => Object.fromEntries((clients || []).map((c) => [c.id, c])),
    [clients]
  );

  const relanceList = useMemo(() => buildRelanceList(factures), [factures]);
  const stats = useMemo(() => getRelanceStats(relanceList), [relanceList]);

  const filtered = useMemo(() => {
    let list = relanceList;
    if (filtrePriorite !== 'tous') list = list.filter((f) => f.priorite === filtrePriorite);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((f) => {
        const client = clientMap[f.client_id];
        return (
          f.numero?.toLowerCase().includes(q) ||
          client?.nom?.toLowerCase().includes(q) ||
          client?.email?.toLowerCase().includes(q)
        );
      });
    }
    return list;
  }, [relanceList, filtrePriorite, search, clientMap]);

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Box sx={{
        background: 'linear-gradient(135deg, #0A0F2C 0%, #1a2750 100%)',
        borderRadius: '16px', px: 4, py: 3, mb: 4,
        display: 'flex', alignItems: 'center', gap: 2,
        boxShadow: '0 8px 32px rgba(10,15,44,0.18)',
        position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{
          position: 'absolute', top: -40, right: -40,
          width: 180, height: 180, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(220,38,38,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <Box sx={{
          width: 48, height: 48, borderRadius: '12px',
          background: 'linear-gradient(135deg, #dc2626 0%, #ea580c 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <WarningAmberIcon sx={{ color: '#fff', fontSize: 24 }} />
        </Box>
        <Box>
          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.4rem', lineHeight: 1.2 }}>
            Centre de Relance
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', mt: 0.3 }}>
            Suivi des factures en attente · Priorisé par urgence
          </Typography>
        </Box>
        <Box sx={{ ml: 'auto', textAlign: 'right' }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>
            Montant total en retard
          </Typography>
          <Typography sx={{ color: '#dc2626', fontWeight: 800, fontSize: '1.3rem' }}>
            {loading ? '—' : formatCurrency(stats.montantEnRetard)}
          </Typography>
        </Box>
      </Box>

      {/* KPIs */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <KPIRelance
            label="Critique (>60j)"
            value={stats.critique}
            color="#dc2626"
            icon={<PriorityHighIcon />}
            loading={loading}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <KPIRelance
            label="Haute (>30j)"
            value={stats.haute}
            color="#ea580c"
            icon={<WarningAmberIcon />}
            loading={loading}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <KPIRelance
            label="En retard (total)"
            value={stats.totalEnRetard}
            color="#d97706"
            icon={<AccessTimeIcon />}
            loading={loading}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <KPIRelance
            label="À venir (dans délai)"
            value={relanceList.filter((f) => f.retard === 0).length}
            color="#059669"
            icon={<CheckCircleOutlineIcon />}
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Tableau principal */}
      <Paper elevation={0} sx={{
        borderRadius: '16px',
        border: '1px solid rgba(10,15,44,0.08)',
        boxShadow: '0 4px 24px rgba(10,15,44,0.05)',
        overflow: 'hidden',
      }}>
        {/* Barre outils */}
        <Box sx={{ px: 3, pt: 2.5, pb: 2, display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Rechercher numéro, client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#8A94A6', fontSize: 18 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              width: 260,
              '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.875rem' },
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
            <FilterListIcon sx={{ color: '#8A94A6', fontSize: 18 }} />
            <ToggleButtonGroup
              value={filtrePriorite}
              exclusive
              onChange={(_, v) => v && setFiltrePriorite(v)}
              size="small"
              sx={{ '& .MuiToggleButton-root': { borderRadius: '8px !important', fontSize: '0.78rem', px: 1.5, py: 0.5 } }}
            >
              <ToggleButton value="tous">Tous</ToggleButton>
              <ToggleButton value="critique" sx={{ color: '#dc2626', '&.Mui-selected': { backgroundColor: 'rgba(220,38,38,0.12)', color: '#dc2626' } }}>Critique</ToggleButton>
              <ToggleButton value="haute" sx={{ color: '#ea580c', '&.Mui-selected': { backgroundColor: 'rgba(234,88,12,0.12)', color: '#ea580c' } }}>Haute</ToggleButton>
              <ToggleButton value="normale" sx={{ color: '#d97706', '&.Mui-selected': { backgroundColor: 'rgba(217,119,6,0.12)', color: '#d97706' } }}>Normale</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        <Divider />

        {loading ? (
          <Box sx={{ p: 3 }}>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={52} sx={{ borderRadius: '8px', mb: 1 }} />
            ))}
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 56, color: '#059669', opacity: 0.4, mb: 1 }} />
            <Typography sx={{ color: '#8A94A6', fontSize: '0.95rem' }}>
              {relanceList.length === 0
                ? 'Aucune facture en attente de relance.'
                : 'Aucun résultat pour ce filtre.'}
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'rgba(10,15,44,0.03)' }}>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#8A94A6' }}>Priorité</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#8A94A6' }}>N° Facture</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#8A94A6' }}>Client</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#8A94A6' }} align="right">Montant TTC</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#8A94A6' }}>Retard</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#8A94A6' }}>Âge</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#8A94A6' }} align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((f) => {
                  const cfg = PRIORITE_CONFIG[f.priorite];
                  const client = clientMap[f.client_id];
                  return (
                    <TableRow
                      key={f.id}
                      hover
                      sx={{
                        cursor: 'pointer',
                        borderLeft: `3px solid ${cfg.color}`,
                        '&:hover': { backgroundColor: `${cfg.color}06` },
                      }}
                      onClick={() => navigate(`/factures/${f.id}`)}
                    >
                      <TableCell>
                        <Chip
                          label={cfg.label}
                          size="small"
                          sx={{
                            backgroundColor: cfg.bg,
                            color: cfg.color,
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            border: `1px solid ${cfg.border}`,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: NAVY, fontSize: '0.85rem' }}>
                        {f.numero ?? '—'}
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 500, color: NAVY }}>
                            {client?.nom ?? '—'}
                          </Typography>
                          {client?.email && (
                            <Typography sx={{ fontSize: '0.72rem', color: '#8A94A6' }}>
                              {client.email}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: NAVY }}>
                          {formatCurrency(f.total_ttc)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ minWidth: 150 }}>
                        <RetardBar retard={f.retard} />
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: '0.82rem', color: '#8A94A6' }}>
                          {f.joursTotal > 0 ? `${f.joursTotal}j` : "Aujourd'hui"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                        <Tooltip title="Voir la facture" arrow>
                          <Button
                            size="small"
                            endIcon={<ArrowForwardIcon sx={{ fontSize: '14px !important' }} />}
                            onClick={() => navigate(`/factures/${f.id}`)}
                            sx={{
                              fontSize: '0.75rem',
                              color: NAVY,
                              borderRadius: '8px',
                              px: 1.5,
                              border: '1px solid rgba(10,15,44,0.15)',
                              '&:hover': { backgroundColor: GOLD + '15', borderColor: GOLD, color: NAVY },
                            }}
                          >
                            Voir
                          </Button>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Pied de tableau */}
        {filtered.length > 0 && (
          <Box sx={{ px: 3, py: 1.5, backgroundColor: 'rgba(10,15,44,0.02)', borderTop: '1px solid rgba(10,15,44,0.06)' }}>
            <Typography sx={{ fontSize: '0.8rem', color: '#8A94A6' }}>
              {filtered.length} facture{filtered.length > 1 ? 's' : ''} affichée{filtered.length > 1 ? 's' : ''}
              {filtrePriorite !== 'tous' && ` · Filtre : ${PRIORITE_CONFIG[filtrePriorite]?.label}`}
              {search && ` · Recherche : "${search}"`}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Légende */}
      <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {Object.entries(PRIORITE_CONFIG).map(([key, cfg]) => (
          <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: cfg.color }} />
            <Typography sx={{ fontSize: '0.75rem', color: '#8A94A6' }}>
              <strong>{cfg.label}</strong> :{' '}
              {key === 'critique' && 'retard > 60j ou > 30j + >50k MAD'}
              {key === 'haute' && 'retard > 30j ou > 15j + >20k MAD'}
              {key === 'normale' && 'retard 1–30j'}
              {key === 'faible' && 'dans le délai (30j)'}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default RelanceCenter;
