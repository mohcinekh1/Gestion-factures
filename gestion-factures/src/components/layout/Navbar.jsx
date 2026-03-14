import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../contexts/AuthContext';
import { DRAWER_WIDTH } from './Sidebar';

function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: `calc(100% - ${DRAWER_WIDTH}px)`,
        ml: `${DRAWER_WIDTH}px`,
        backgroundColor: '#fff',
        color: '#1E3A5F',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'flex-end', gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {currentUser?.email}
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          size="small"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
        >
          Déconnexion
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
