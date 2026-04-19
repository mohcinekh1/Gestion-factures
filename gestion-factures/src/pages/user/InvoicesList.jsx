import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Skeleton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import DescriptionIcon from '@mui/icons-material/Description';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../contexts/AuthContext';
import { useInvoices } from '../../hooks/useInvoices';
import { useClients } from '../../hooks/useClients';
import { formatCurrency } from '../../utils/calculations';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const NAVY = '#0A0F2C';
const GOLD = '#F0B429';

const STATUT_CONFIG = {
  EN_ATTENTE: { label: 'En attente', color: '#D97706', bg: 'rgba(217,119,6,0.15)' },
  PAYEE: { label: 'Payée', color: '#059669', bg: 'rgba(5,150,105,0.15)' },
  REJETEE: { label: 'Rejetée', color: '#dc2626', bg: 'rgba(220,38,38,0.15)' },
};

function InvoicesList() {
  const navigate = useNavigate();
  const { currentUser, userRole } = useAuth();
  const { factures, loading, error, deleteFacture } = useInvoices(
    userRole === 'admin' ? null : currentUser?.uid
  );
  const { clients } = useClients();
  const [filterStatut, setFilterStatut] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [factureToDelete, setFactureToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleOpenDelete = (f) => {
    setFactureToDelete(f);
    setDeleteDialogOpen(true);
  };
  const handleCloseDelete = () => {
    setDeleteDialogOpen(false);
    setFactureToDelete(null);
  };
  const handleConfirmDelete = async () => {
    if (!factureToDelete) return;
    try {
      await deleteFacture(factureToDelete.id);
      setSnackbar({ open: true, message: `Facture ${factureToDelete.numero} supprimée`, severity: 'success' });
      handleCloseDelete();
    } catch {
      setSnackbar({ open: true, message: 'Erreur lors de la suppression', severity: 'error' });
    }
  };

  const clientMap = useMemo(
    () => Object.fromEntries(clients.map((c) => [c.id, c])),
    [clients]
  );

  const filteredFactures = useMemo(() => {
    if (!filterStatut) return factures;
    return factures.filter((f) => f.statut === filterStatut);
  }, [factures, filterStatut]);

  const getClientName = (clientId) => clientMap[clientId]?.nom ?? '—';

  const formatDate = (timestamp) => {
    if (!timestamp) return '—';
    try {
      const d = typeof timestamp === 'number' ? new Date(timestamp) : timestamp;
      return format(d, 'dd MMM yyyy', { locale: fr });
    } catch {
      return '—';
    }
  };

  if (loading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={88} sx={{ mb: 3, borderRadius: '16px' }} />
        <Skeleton variant="rectangular" height={56} sx={{ mb: 2, borderRadius: '10px' }} />
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: '16px' }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          background: `linear-gradient(135deg, ${NAVY} 0%, #141c3f 100%)`,
          borderRadius: '16px',
          px: 4, py: 3,
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          boxShadow: '0 8px 32px rgba(10,15,44,0.18)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{
          position: 'absolute', top: -40, right: -40,
          width: 180, height: 180, borderRadius: '50%',
          background: `radial-gradient(circle, rgba(240,180,41,0.12) 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            width: 48, height: 48, borderRadius: '12px',
            background: `linear-gradient(135deg, ${GOLD} 0%, #FFD95A 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <DescriptionIcon sx={{ color: NAVY, fontSize: 24 }} />
          </Box>
          <Box>
            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.4rem', lineHeight: 1.2 }}>
              Factures
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem', mt: 0.3 }}>
              {factures.length} facture{factures.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/factures/nouvelle')}
          sx={{
            backgroundColor: GOLD,
            color: NAVY,
            fontWeight: 700,
            fontSize: '0.85rem',
            borderRadius: '10px',
            px: 2.5, py: 1.1,
            '&:hover': { backgroundColor: '#FFD95A' },
          }}
        >
          Nouvelle facture
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>
          {error}
        </Alert>
      )}

      <FormControl size="small" sx={{ mb: 2.5, minWidth: 200 }}>
        <InputLabel>Filtrer par statut</InputLabel>
        <Select
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
          label="Filtrer par statut"
          sx={{
            borderRadius: '10px',
            backgroundColor: '#fff',
            '& fieldset': { borderColor: 'rgba(10,15,44,0.12)' },
            '&:hover fieldset': { borderColor: GOLD },
          }}
        >
          <MenuItem value="">Tous les statuts</MenuItem>
          {Object.entries(STATUT_CONFIG).map(([key, cfg]) => (
            <MenuItem key={key} value={key}>{cfg.label}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <TableContainer
        sx={{
          borderRadius: '16px',
          border: '1px solid rgba(10,15,44,0.08)',
          boxShadow: '0 4px 24px rgba(10,15,44,0.06)',
          backgroundColor: '#fff',
          overflow: 'hidden',
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                background: `linear-gradient(90deg, ${NAVY} 0%, #141c3f 100%)`,
                '& .MuiTableCell-root': {
                  color: 'rgba(255,255,255,0.7)',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  borderBottom: 'none',
                  py: 2,
                },
              }}
            >
              <TableCell>Numéro</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Total TTC</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredFactures.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <DescriptionIcon sx={{ fontSize: 40, color: 'rgba(10,15,44,0.12)', mb: 1, display: 'block', mx: 'auto' }} />
                  <Typography sx={{ color: '#8A94A6', fontSize: '0.875rem' }}>
                    {factures.length === 0
                      ? 'Aucune facture. Cliquez sur "Nouvelle facture" pour commencer.'
                      : 'Aucune facture avec ce statut.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredFactures.map((f, index) => {
                const statutCfg = STATUT_CONFIG[f.statut] ?? STATUT_CONFIG.EN_ATTENTE;
                return (
                  <TableRow
                    key={f.id}
                    sx={{
                      backgroundColor: index % 2 === 0 ? '#fff' : 'rgba(10,15,44,0.018)',
                      '&:hover': { backgroundColor: 'rgba(240,180,41,0.06)' },
                      '& .MuiTableCell-root': {
                        borderBottom: '1px solid rgba(10,15,44,0.06)',
                        py: 1.8,
                        fontSize: '0.875rem',
                      },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600, color: NAVY }}>{f.numero ?? '—'}</TableCell>
                    <TableCell>{getClientName(f.client_id)}</TableCell>
                    <TableCell>{formatDate(f.date_creation)}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(f.total_ttc)}</TableCell>
                    <TableCell>
                      <Chip
                        label={statutCfg.label}
                        size="small"
                        sx={{
                          backgroundColor: statutCfg.bg,
                          color: statutCfg.color,
                          fontWeight: 600,
                          fontSize: '0.75rem',
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/factures/${f.id}`)}
                        title="Voir le détail"
                        sx={{
                          color: NAVY,
                          mr: 0.5,
                          '&:hover': { color: GOLD, backgroundColor: 'rgba(240,180,41,0.1)' },
                        }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/factures/${f.id}`)}
                        title="Télécharger PDF (page détail)"
                        sx={{
                          color: NAVY,
                          mr: 0.5,
                          '&:hover': { color: GOLD, backgroundColor: 'rgba(240,180,41,0.1)' },
                        }}
                      >
                        <PictureAsPdfIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); handleOpenDelete(f); }}
                        title="Supprimer"
                        sx={{
                          color: '#dc2626',
                          '&:hover': { color: '#b91c1c', backgroundColor: 'rgba(220,38,38,0.1)' },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={deleteDialogOpen} onClose={handleCloseDelete} maxWidth="xs" fullWidth>
        <Box sx={{
          background: `linear-gradient(135deg, ${NAVY} 0%, #141c3f 100%)`,
          px: 3, py: 2.5,
          display: 'flex', alignItems: 'center', gap: 1.5,
        }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: '8px',
            backgroundColor: 'rgba(229,62,62,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <DeleteIcon sx={{ color: '#fc8181', fontSize: 18 }} />
          </Box>
          <DialogTitle sx={{ p: 0, color: '#fff', fontWeight: 700, fontSize: '1.05rem' }}>
            Supprimer la facture
          </DialogTitle>
        </Box>
        <DialogContent sx={{ px: 3, py: 2.5 }}>
          <DialogContentText sx={{ color: '#4A5568', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Êtes-vous sûr de vouloir supprimer la facture{' '}
            <Box component="span" sx={{ fontWeight: 700, color: NAVY }}>
              « {factureToDelete?.numero} »
            </Box>
            {' '}? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={handleCloseDelete} sx={{ color: '#8A94A6', fontWeight: 600, borderRadius: '8px' }}>
            Annuler
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            sx={{
              backgroundColor: '#e53e3e',
              fontWeight: 700, borderRadius: '8px',
              '&:hover': { backgroundColor: '#c53030' },
            }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default InvoicesList;
