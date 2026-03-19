import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box, Avatar, Chip } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../contexts/AuthContext';
import { DRAWER_WIDTH } from './Sidebar';

const NAVY = '#0A0F2C';
const GOLD = '#FB923C';

function Navbar() {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = currentUser?.email
    ? currentUser.email.slice(0, 2).toUpperCase()
    : '??';

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: `calc(100% - ${DRAWER_WIDTH}px)`,
        ml: `${DRAWER_WIDTH}px`,
        background: 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(251,146,60,0.15)',
        boxShadow: '0 2px 16px rgba(10,15,44,0.07)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'flex-end', gap: 2, minHeight: '64px !important' }}>
        {/* Badge rôle */}
        {userRole === 'admin' && (
          <Chip
            label="Admin"
            size="small"
            sx={{
              backgroundColor: `rgba(251,146,60,0.15)`,
              color: GOLD,
              fontWeight: 700,
              fontSize: '0.7rem',
              letterSpacing: 0.8,
              border: `1px solid rgba(251,146,60,0.3)`,
              height: 22,
            }}
          />
        )}

        {/* Email */}
        <Typography
          variant="body2"
          sx={{ color: '#8A94A6', fontSize: '0.82rem', display: { xs: 'none', sm: 'block' } }}
        >
          {currentUser?.email}
        </Typography>

        {/* Avatar + bouton déconnexion */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            sx={{
              width: 32, height: 32,
              background: `linear-gradient(135deg, ${NAVY} 0%, #1a2750 100%)`,
              fontSize: '0.75rem', fontWeight: 700,
              border: `2px solid ${GOLD}`,
              color: GOLD,
            }}
          >
            {initials}
          </Avatar>

          <Box
            onClick={handleLogout}
            sx={{
              display: 'flex', alignItems: 'center', gap: 0.6,
              cursor: 'pointer',
              px: 1.5, py: 0.7,
              borderRadius: '8px',
              border: `1px solid rgba(10,15,44,0.12)`,
              color: '#8A94A6',
              fontSize: '0.8rem', fontWeight: 600,
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: `rgba(251,146,60,0.1)`,
                borderColor: `rgba(251,146,60,0.4)`,
                color: GOLD,
                '& svg': { color: GOLD },
              },
            }}
          >
            <LogoutIcon sx={{ fontSize: 16, color: 'inherit', transition: 'color 0.2s' }} />
            <Typography sx={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit', display: { xs: 'none', sm: 'block' } }}>
              Déconnexion
            </Typography>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
