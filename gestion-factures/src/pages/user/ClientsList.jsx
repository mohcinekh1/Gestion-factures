import { useState, useMemo, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Skeleton,
  Avatar,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import { useAuth } from '../../contexts/AuthContext';
import { useClients } from '../../hooks/useClients';
import ClientForm from '../../components/clients/ClientForm';

const NAVY = '#0A0F2C';
const GOLD = '#F0B429';

function getInitials(nom) {
  if (!nom) return '?';
  const parts = nom.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return nom.slice(0, 2).toUpperCase();
}

function ClientsList() {
  const { currentUser, userRole } = useAuth();
  const isAdmin = userRole === 'admin';
  const { clients, loading, error, addClient, updateClient, deleteClient } = useClients(isAdmin ? null : currentUser?.uid);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const submittingRef = useRef(false);

  const filteredClients = useMemo(() => {
    if (!search.trim()) return clients;
    const term = search.trim().toLowerCase();
    return clients.filter((c) => c.nom?.toLowerCase().includes(term));
  }, [clients, search]);

  const handleOpenAdd = () => { setEditingClient(null); setFormOpen(true); };
  const handleOpenEdit = (client) => { setEditingClient(client); setFormOpen(true); };
  const handleCloseForm = () => { setFormOpen(false); setEditingClient(null); };
  const handleFormSubmit = async (values) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    try {
      if (editingClient) await updateClient(editingClient.id, values);
      else await addClient({ ...values, created_by: currentUser?.uid });
      handleCloseForm();
    } finally {
      submittingRef.current = false;
    }
  };
  const handleOpenDelete = (client) => { setClientToDelete(client); setDeleteDialogOpen(true); };
  const handleCloseDelete = () => { setDeleteDialogOpen(false); setClientToDelete(null); };
  const handleConfirmDelete = async () => {
    if (clientToDelete) { await deleteClient(clientToDelete.id); handleCloseDelete(); }
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
      {/* ── En-tête premium ── */}
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
        {/* Décoration */}
        <Box sx={{
          position: 'absolute', top: -40, right: -40,
          width: 180, height: 180, borderRadius: '50%',
          background: `radial-gradient(circle, rgba(240,180,41,0.12) 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            width: 48, height: 48, borderRadius: '12px',
            background: `linear-gradient(135deg, #C89A1A 0%, #F0B429 35%, #FFD95A 65%, #F0B429 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <PeopleAltIcon sx={{ color: NAVY, fontSize: 24 }} />
          </Box>
          <Box>
            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.4rem', lineHeight: 1.2 }}>
              Clients
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem', mt: 0.3 }}>
              {clients.length} client{clients.length !== 1 ? 's' : ''} enregistré{clients.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          sx={{
            backgroundColor: GOLD,
            color: NAVY,
            fontWeight: 700,
            fontSize: '0.85rem',
            letterSpacing: 0.8,
            borderRadius: '10px',
            px: 2.5, py: 1.1,
            boxShadow: `0 4px 16px rgba(240,180,41,0.35)`,
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: '#FFD95A',
              boxShadow: `0 6px 24px rgba(240,180,41,0.5)`,
              transform: 'translateY(-1px)',
            },
          }}
        >
          Nouveau client
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>
          {error}
        </Alert>
      )}

      {/* ── Barre de recherche ── */}
      <TextField
        placeholder="Rechercher par nom..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        size="small"
        sx={{
          mb: 2.5,
          maxWidth: 360,
          '& .MuiOutlinedInput-root': {
            borderRadius: '10px',
            backgroundColor: '#fff',
            fontSize: '0.875rem',
            '& fieldset': { borderColor: 'rgba(10,15,44,0.12)' },
            '&:hover fieldset': { borderColor: GOLD },
            '&.Mui-focused fieldset': { borderColor: GOLD, borderWidth: '2px' },
          },
          '& .MuiInputLabel-root.Mui-focused': { color: GOLD },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: '#8A94A6', fontSize: 18 }} />
            </InputAdornment>
          ),
        }}
      />

      {/* ── Tableau ── */}
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
              <TableCell>Nom</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Téléphone</TableCell>
              <TableCell>Adresse</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <PeopleAltIcon sx={{ fontSize: 40, color: 'rgba(10,15,44,0.12)', mb: 1, display: 'block', mx: 'auto' }} />
                  <Typography sx={{ color: '#8A94A6', fontSize: '0.875rem' }}>
                    {clients.length === 0
                      ? 'Aucun client. Cliquez sur "Nouveau client" pour commencer.'
                      : 'Aucun résultat pour votre recherche.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredClients.map((client, index) => (
                <TableRow
                  key={client.id}
                  sx={{
                    backgroundColor: index % 2 === 0 ? '#fff' : 'rgba(10,15,44,0.018)',
                    transition: 'background-color 0.15s ease',
                    '&:hover': { backgroundColor: `rgba(240,180,41,0.06)` },
                    '& .MuiTableCell-root': {
                      borderBottom: '1px solid rgba(10,15,44,0.06)',
                      py: 1.8,
                      fontSize: '0.875rem',
                      color: '#1A1F36',
                    },
                  }}
                >
                  {/* Nom avec avatar */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        sx={{
                          width: 34, height: 34,
                          background: `linear-gradient(135deg, ${NAVY} 0%, #1a2750 100%)`,
                          fontSize: '0.72rem', fontWeight: 700,
                          border: `2px solid rgba(240,180,41,0.3)`,
                          color: GOLD,
                          flexShrink: 0,
                        }}
                      >
                        {getInitials(client.nom)}
                      </Avatar>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: NAVY }}>
                        {client.nom}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell sx={{ color: '#4A5568 !important' }}>{client.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={client.tel}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(10,15,44,0.05)',
                        color: '#4A5568',
                        fontSize: '0.78rem',
                        fontWeight: 500,
                        height: 24,
                        borderRadius: '6px',
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200, color: '#6B7280 !important', fontSize: '0.82rem !important' }}>
                    {client.adresse}
                  </TableCell>

                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenEdit(client)}
                        title="Modifier"
                        sx={{
                          color: NAVY,
                          backgroundColor: 'rgba(10,15,44,0.05)',
                          borderRadius: '8px',
                          width: 32, height: 32,
                          '&:hover': {
                            backgroundColor: `rgba(240,180,41,0.15)`,
                            color: GOLD,
                          },
                        }}
                      >
                        <EditIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDelete(client)}
                        title="Supprimer"
                        sx={{
                          color: '#e53e3e',
                          backgroundColor: 'rgba(229,62,62,0.06)',
                          borderRadius: '8px',
                          width: 32, height: 32,
                          '&:hover': {
                            backgroundColor: 'rgba(229,62,62,0.15)',
                            color: '#c53030',
                          },
                        }}
                      >
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <ClientForm
        open={formOpen}
        onClose={handleCloseForm}
        client={editingClient}
        clients={clients}
        onSubmit={handleFormSubmit}
      />

      {/* ── Dialog de suppression premium ── */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDelete}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 24px 60px rgba(10,15,44,0.2)',
            maxWidth: 420,
            width: '100%',
            overflow: 'hidden',
          },
        }}
      >
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
            Supprimer le client
          </DialogTitle>
        </Box>

        <DialogContent sx={{ px: 3, py: 2.5 }}>
          <DialogContentText sx={{ color: '#4A5568', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Êtes-vous sûr de vouloir supprimer le client{' '}
            <Box component="span" sx={{ fontWeight: 700, color: NAVY }}>
              « {clientToDelete?.nom} »
            </Box>
            {' '}? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={handleCloseDelete}
            sx={{
              color: '#8A94A6', fontWeight: 600, borderRadius: '8px',
              border: '1px solid rgba(10,15,44,0.12)',
              px: 2.5,
              '&:hover': { backgroundColor: 'rgba(10,15,44,0.04)' },
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            sx={{
              backgroundColor: '#e53e3e',
              fontWeight: 700, borderRadius: '8px', px: 2.5,
              boxShadow: '0 4px 12px rgba(229,62,62,0.3)',
              '&:hover': {
                backgroundColor: '#c53030',
                boxShadow: '0 6px 18px rgba(229,62,62,0.4)',
              },
            }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ClientsList;
