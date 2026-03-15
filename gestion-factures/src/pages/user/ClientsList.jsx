import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { useClients } from '../../hooks/useClients';

function ClientsList() {
  const { clients, loading, error } = useClients();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Clients
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Typography color="text.secondary">
        {clients.length} client(s) — Interface complète à implémenter (Étape 3.4)
      </Typography>
    </Box>
  );
}

export default ClientsList;
