import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Skeleton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { useAuth } from '../../contexts/AuthContext';
import * as firebaseService from '../../services/firebaseService';
import { useArticles } from '../../hooks/useArticles';
import PaymentForm from '../../components/factures/PaymentForm';
import { formatCurrency } from '../../utils/calculations';
import { generateInvoicePDF } from '../../utils/pdfGenerator';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const NAVY = '#0A0F2C';
const GOLD = '#F0B429';

const STATUT_CONFIG = {
  EN_ATTENTE: { label: 'En attente', color: '#D97706', bg: 'rgba(217,119,6,0.15)' },
  PAYEE: { label: 'Payée', color: '#059669', bg: 'rgba(5,150,105,0.15)' },
  REJETEE: { label: 'Rejetée', color: '#dc2626', bg: 'rgba(220,38,38,0.15)' },
};

function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, userRole } = useAuth();
  const { categories } = useArticles();
  const [facture, setFacture] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const [f, c] = await Promise.all([
          firebaseService.getFactureById(id),
          null,
        ]);
        if (cancelled) return;
        if (!f) {
          setError('Facture introuvable');
          setFacture(null);
          return;
        }
        const isOwner = f.created_by === currentUser?.uid;
        const isAdmin = userRole === 'admin';
        if (!isOwner && !isAdmin) {
          setError('Accès non autorisé');
          setFacture(null);
          return;
        }
        setFacture(f);
        if (f.client_id) {
          const clientData = await firebaseService.getClientById(f.client_id);
          if (!cancelled) setClient(clientData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || 'Erreur lors du chargement');
          setFacture(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id, currentUser?.uid]);

  const formatDate = (timestamp) => {
    if (!timestamp) return '—';
    try {
      const d = typeof timestamp === 'number' ? new Date(timestamp) : timestamp;
      return format(d, 'dd MMMM yyyy', { locale: fr });
    } catch {
      return '—';
    }
  };

  const handleDownloadPdf = () => {
    if (!facture) return;
    generateInvoicePDF(facture, client ?? {}, facture.articles ?? [], categories ?? []);
  };

  const handleConfirmDelete = async () => {
    if (!facture) return;
    try {
      await firebaseService.deleteFacture(facture.id);
      setSnackbar({ open: true, message: `Facture ${facture.numero} supprimée`, severity: 'success' });
      setDeleteDialogOpen(false);
      setTimeout(() => navigate('/factures'), 800);
    } catch (err) {
      setSnackbar({ open: true, message: err?.message || 'Erreur lors de la suppression', severity: 'error' });
    }
  };

  const canEdit = facture?.statut === 'EN_ATTENTE';

  if (loading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={48} sx={{ mb: 2, borderRadius: '10px' }} />
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: '16px' }} />
      </Box>
    );
  }

  if (error || !facture) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/factures')}
          sx={{ mb: 2, color: NAVY }}
        >
          Retour
        </Button>
        <Alert severity="error" sx={{ borderRadius: '10px' }}>
          {error || 'Facture introuvable'}
        </Alert>
      </Box>
    );
  }

  const statutCfg = STATUT_CONFIG[facture.statut] ?? STATUT_CONFIG.EN_ATTENTE;

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/factures')}
        sx={{
          mb: 2,
          color: NAVY,
          fontWeight: 600,
          '&:hover': { color: GOLD },
        }}
      >
        Retour à la liste
      </Button>

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
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            width: 48, height: 48, borderRadius: '12px',
            background: `linear-gradient(135deg, ${GOLD} 0%, #FFD95A 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ReceiptLongIcon sx={{ color: NAVY, fontSize: 24 }} />
          </Box>
          <Box>
            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.4rem' }}>
              {facture.numero}
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem' }}>
              {formatDate(facture.date_creation)}
            </Typography>
          </Box>
          <Chip
            label={statutCfg.label}
            sx={{
              backgroundColor: statutCfg.bg,
              color: statutCfg.color,
              fontWeight: 600,
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<PictureAsPdfIcon />}
            onClick={handleDownloadPdf}
            sx={{
              borderColor: GOLD,
              color: GOLD,
              '&:hover': { borderColor: GOLD, backgroundColor: 'rgba(240,180,41,0.1)' },
            }}
          >
            Télécharger PDF
          </Button>
          {canEdit && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/factures/${id}/modifier`)}
              sx={{
                backgroundColor: GOLD,
                color: NAVY,
                '&:hover': { backgroundColor: '#FFD95A' },
              }}
            >
              Modifier
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialogOpen(true)}
            sx={{
              borderColor: '#dc2626',
              color: '#dc2626',
              '&:hover': { borderColor: '#b91c1c', backgroundColor: 'rgba(220,38,38,0.08)' },
            }}
          >
            Supprimer
          </Button>
        </Box>
      </Box>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
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
              « {facture?.numero} »
            </Box>
            {' '}? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: '#8A94A6', fontWeight: 600, borderRadius: '8px' }}>
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

      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: '16px',
          border: '1px solid rgba(10,15,44,0.08)',
          boxShadow: '0 4px 24px rgba(10,15,44,0.06)',
          mb: 3,
        }}
      >
        <Typography sx={{ fontWeight: 700, color: NAVY, mb: 2 }}>Client</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography><strong>{client?.nom ?? '—'}</strong></Typography>
          <Typography sx={{ color: '#6B7280', fontSize: '0.875rem' }}>
            {client?.email} · {client?.tel}
          </Typography>
          <Typography sx={{ color: '#6B7280', fontSize: '0.875rem' }}>
            {client?.adresse}
          </Typography>
        </Box>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: '16px',
          border: '1px solid rgba(10,15,44,0.08)',
          boxShadow: '0 4px 24px rgba(10,15,44,0.06)',
          mb: 3,
        }}
      >
        <Typography sx={{ fontWeight: 700, color: NAVY, mb: 2 }}>Articles</Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'rgba(10,15,44,0.04)' }}>
                <TableCell sx={{ fontWeight: 600 }}>Désignation</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Qté</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Prix unit.</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Remise</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(facture.articles || []).map((a, i) => (
                <TableRow key={i}>
                  <TableCell>{a.designation ?? '—'}</TableCell>
                  <TableCell align="right">{a.qte}</TableCell>
                  <TableCell align="right">{formatCurrency(a.prix_unitaire)}</TableCell>
                  <TableCell align="right">{a.remise ? `${a.remise}%` : '0%'}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {formatCurrency(a.total_ligne ?? a.qte * a.prix_unitaire * (1 - (a.remise || 0) / 100))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(10,15,44,0.08)' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
            <Typography>Total HT : {formatCurrency(facture.total_ht)}</Typography>
            <Typography>TVA : {formatCurrency(facture.tva)}</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: GOLD }}>
              Total TTC : {formatCurrency(facture.total_ttc)}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: '16px',
          border: '1px solid rgba(10,15,44,0.08)',
          boxShadow: '0 4px 24px rgba(10,15,44,0.06)',
        }}
      >
        <Typography sx={{ fontWeight: 700, color: NAVY, mb: 2 }}>Suivi du paiement</Typography>
        <PaymentForm
          facture={facture}
          userRole={userRole || 'user'}
          onSuccess={(payload) => setFacture((prev) => (prev ? { ...prev, ...payload } : null))}
        />
      </Paper>
    </Box>
  );
}

export default InvoiceDetail;
