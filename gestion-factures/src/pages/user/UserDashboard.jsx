import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../contexts/AuthContext';

function UserDashboard() {
  const navigate = useNavigate();
  const { currentUser, userRole, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Bienvenue !</Typography>
      <Typography color="text.secondary">
        Connecté en tant que : <strong>{currentUser?.email}</strong>
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1 }}>
        Rôle : <strong>{userRole || 'user'}</strong>
      </Typography>
      <Button
        variant="outlined"
        color="primary"
        startIcon={<LogoutIcon />}
        onClick={handleLogout}
        sx={{ mt: 3 }}
      >
        Déconnexion
      </Button>
    </Box>
  );
}

export default UserDashboard;