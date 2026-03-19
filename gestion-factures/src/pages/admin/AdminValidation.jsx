import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useInvoices } from '../../hooks/useInvoices';
import { useClients } from '../../hooks/useClients';
import { useAuth } from '../../contexts/AuthContext';
import * as firebaseService from '../../services/firebaseService';
import { formatCurrency } from '../../utils/calculations';

const STATUT_CONFIG = {
  EN_ATTENTE: { label: 'En attente', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  PAYEE: { label: 'Payée', color: '#059669', bg: 'rgba(5,150,105,0.15)' },
  REJETEE: { label: 'Rejetée', color: '#dc2626', bg: 'rgba(220,38,38,0.15)' },
};

const FILTER_OPTIONS = [
  { value: 'all', label: 'Toutes' },
  { value: 'EN_ATTENTE', label: 'En attente' },
  { value: 'PAYEE', label: 'Payées' },
  { value: 'REJETEE', label: 'Rejetées' },
];

function AdminValidation() {
  const { factures, loading: loadingFactures, refreshFactures } = useInvoices(null);
  const { clients, loading: loadingClients } = useClients();
  const { currentUser } = useAuth();
  const [filter, setFilter] = useState('all');
  const [users, setUsers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(null);
  const [selectedFacture, setSelectedFacture] = useState(null);
  const [motifRejet, setMotifRejet] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const clientMap = Object.fromEntries((clients || []).map((c) => [c.id, c]));
  const userMap = Object.fromEntries((users || []).map((u) => [u.id, u]));
  const getClientName = (clientId) => clientMap[clientId]?.nom ?? '—';
  const getAdminName = (uid) => userMap[uid]?.nom ?? uid ?? '—';

  const filteredFactures = filter === 'all'
    ? factures
    : factures.filter((f) => f.statut === filter);

  const loading = loadingFactures || loadingClients;

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await firebaseService.getUsers();
        setUsers(data);
      } catch {
        setUsers([]);
      }
    }
    loadUsers();
  }, []);

  const handleFilterChange = (_, newFilter) => {
    if (newFilter !== null) setFilter(newFilter);
  };

  const handleOpenValidate = (facture) => {
    setSelectedFacture(facture);
    setDialogOpen('validate');
  };

  const handleOpenReject = (facture) => {
    setSelectedFacture(facture);
    setMotifRejet('');
    setDialogOpen('reject');
  };

  const handleCloseDialog = () => {
    setDialogOpen(null);
    setSelectedFacture(null);
    setMotifRejet('');
  };

  const handleConfirmValidate = async () => {
    if (!selectedFacture || !currentUser?.uid) return;
    setActionLoading(true);
    try {
      await firebaseService.validateFacture(selectedFacture.id, currentUser.uid);
      await refreshFactures();
      setSnackbar({ open: true, message: 'Facture validée avec succès', severity: 'success' });
      handleCloseDialog();
    } catch (err) {
      setSnackbar({ open: true, message: err?.message || 'Erreur lors de la validation', severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!selectedFacture) return;
    setActionLoading(true);
    try {
      await firebaseService.rejectFacture(selectedFacture.id, motifRejet.trim() || undefined);
      await refreshFactures();
      setSnackbar({ open: true, message: 'Facture rejetée', severity: 'success' });
      handleCloseDialog();
    } catch (err) {
      setSnackbar({ open: true, message: err?.message || 'Erreur lors du rejet', severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSnackbarClose = () => setSnackbar((s) => ({ ...s, open: false }));

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
          background: 'radial-gradient(circle, rgba(251,146,60,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <Box sx={{
          width: 48, height: 48, borderRadius: '12px',
          background: 'linear-gradient(135deg, #FB923C 0%, #FDBA74 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <CheckCircleIcon sx={{ color: '#0A0F2C', fontSize: 24 }} />
        </Box>
        <Box>
          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.4rem', lineHeight: 1.2 }}>
            Validation des factures
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', mt: 0.3 }}>
            Valider ou rejeter les factures en attente
          </Typography>
        </Box>
      </Box>

      {/* Filtre */}
      <Box sx={{ mb: 2 }}>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={handleFilterChange}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              textTransform: 'none',
              fontWeight: 600,
              px: 2,
            },
          }}
        >
          {FILTER_OPTIONS.map((opt) => (
            <ToggleButton key={opt.value} value={opt.value}>
              {opt.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {/* Tableau */}
      <Paper elevation={0} sx={{
        borderRadius: '16px',
        border: '1px solid rgba(10,15,44,0.06)',
        boxShadow: '0 4px 20px rgba(10,15,44,0.04)',
        overflow: 'hidden',
        '&:hover': { boxShadow: '0 12px 32px rgba(10,15,44,0.08)' },
      }}>
        {loading ? (
          <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 0 }} />
        ) : filteredFactures.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>
            Aucune facture à afficher.
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
                  <TableCell sx={{ fontWeight: 600 }}>Validé par</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredFactures.map((f) => {
                  const cfg = STATUT_CONFIG[f.statut] ?? STATUT_CONFIG.EN_ATTENTE;
                  const isPending = f.statut === 'EN_ATTENTE';
                  const validatedBy = f.validated_by_admin ? getAdminName(f.validated_by_admin) : '—';
                  return (
                    <TableRow key={f.id} hover>
                      <TableCell sx={{ fontWeight: 500 }}>{f.numero ?? '—'}</TableCell>
                      <TableCell>{getClientName(f.client_id)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {formatCurrency(f.total_ttc)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={cfg.label}
                          size="small"
                          sx={{ backgroundColor: cfg.bg, color: cfg.color, fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                        {validatedBy}
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          startIcon={<CheckCircleOutlineIcon />}
                          onClick={() => handleOpenValidate(f)}
                          disabled={!isPending}
                          sx={{
                            color: '#059669',
                            mr: 1,
                            '&:hover': { backgroundColor: 'rgba(5,150,105,0.08)' },
                            '&.Mui-disabled': { color: 'rgba(0,0,0,0.26)' },
                          }}
                        >
                          Valider
                        </Button>
                        <Button
                          size="small"
                          startIcon={<CancelIcon />}
                          onClick={() => handleOpenReject(f)}
                          disabled={!isPending}
                          sx={{
                            color: '#dc2626',
                            '&:hover': { backgroundColor: 'rgba(220,38,38,0.08)' },
                            '&.Mui-disabled': { color: 'rgba(0,0,0,0.26)' },
                          }}
                        >
                          Rejeter
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Dialog de validation */}
      <Dialog open={dialogOpen === 'validate'} onClose={handleCloseDialog}>
        <DialogTitle>Confirmer la validation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir valider la facture <strong>{selectedFacture?.numero}</strong> ?
            Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleConfirmValidate}
            disabled={actionLoading}
            sx={{ backgroundColor: '#059669', '&:hover': { backgroundColor: '#047857' } }}
          >
            {actionLoading ? 'Validation...' : 'Valider'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de rejet */}
      <Dialog open={dialogOpen === 'reject'} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Rejeter la facture</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Vous êtes sur le point de rejeter la facture <strong>{selectedFacture?.numero}</strong>.
            Cette action est irréversible.
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            label="Motif de rejet (optionnel)"
            multiline
            rows={3}
            value={motifRejet}
            onChange={(e) => setMotifRejet(e.target.value)}
            placeholder="Ex. Pièce manquante, montant incorrect..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleConfirmReject}
            disabled={actionLoading}
            sx={{ backgroundColor: '#dc2626', '&:hover': { backgroundColor: '#b91c1c' } }}
          >
            {actionLoading ? 'Rejet...' : 'Rejeter'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AdminValidation;
