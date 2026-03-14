import { Box, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';

function InvoiceDetail() {
  const { id } = useParams();

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Détail facture #{id}</Typography>
      <Typography color="text.secondary">Page à implémenter (Phase 4)</Typography>
    </Box>
  );
}

export default InvoiceDetail;
