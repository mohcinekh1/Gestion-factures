import { Component } from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';

const NAVY = '#0A0F2C';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta?.env?.DEV) {
      // eslint-disable-next-line no-console
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 560,
            p: 3,
            borderRadius: '16px',
            border: '1px solid rgba(10,15,44,0.10)',
            boxShadow: '0 14px 40px rgba(10,15,44,0.10)',
          }}
        >
          <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: NAVY, mb: 1 }}>
            Une erreur est survenue
          </Typography>
          <Typography sx={{ color: '#64748b', fontSize: '0.92rem', mb: 2 }}>
            L’application a rencontré un problème inattendu. Tu peux revenir en arrière ou rafraîchir la page.
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => window.history.back()}
              sx={{ borderRadius: '10px' }}
            >
              Retour
            </Button>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={() => window.location.reload()}
              sx={{ borderRadius: '10px', backgroundColor: NAVY, '&:hover': { backgroundColor: '#141c3f' } }}
            >
              Rafraîchir
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }
}

export default ErrorBoundary;

