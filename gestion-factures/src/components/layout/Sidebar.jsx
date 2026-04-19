import { NavLink } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Badge,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import LogoutIcon from '@mui/icons-material/Logout';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { useAuth } from '../../contexts/AuthContext';
import { useInvoices } from '../../hooks/useInvoices';
import { buildRelanceList } from '../../utils/relanceUtils';

export const DRAWER_WIDTH = 260;

const NAVY = '#0A0F2C';
const GOLD = '#F0B429';

const userMenuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon />, end: true },
  { path: '/clients', label: 'Clients', icon: <PeopleIcon /> },
  { path: '/factures', label: 'Factures', icon: <DescriptionIcon /> },
];

const adminMenuItems = [
  { path: '/admin', label: 'Dashboard Admin', icon: <AdminPanelSettingsIcon />, end: true },
  { path: '/admin/articles', label: 'Articles', icon: <InventoryIcon /> },
  { path: '/admin/categories', label: 'Cat\xE9gories', icon: <CategoryIcon /> },
  { path: '/admin/validation', label: 'Validation factures', icon: <CheckCircleIcon /> },
];

const navItemSx = {
  borderRadius: '10px',
  color: 'rgba(255,255,255,0.65)',
  transition: 'all 0.2s ease',
  '&.active': {
    backgroundColor: 'rgba(240,180,41,0.15)',
    color: GOLD,
    '& .MuiListItemIcon-root': { color: GOLD },
    borderLeft: `3px solid ${GOLD}`,
    pl: '13px',
  },
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.06)',
    color: '#fff',
    '& .MuiListItemIcon-root': { color: 'rgba(255,255,255,0.9)' },
  },
};

function Sidebar() {
  const { userRole, logout } = useAuth();
  const isAdmin = userRole === 'admin';

  const { factures } = useInvoices(null);
  const relanceCount = buildRelanceList(factures).length;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: NAVY,
          borderRight: 'none',
          boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
          overflow: 'hidden',
        },
      }}
    >
      <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <Box sx={{
          position: 'absolute', top: -80, right: -80,
          width: 280, height: 280, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(240,180,41,0.10) 0%, transparent 70%)',
        }} />
        <Box sx={{
          position: 'absolute', bottom: -60, left: -60,
          width: 220, height: 220, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(26,39,80,0.8) 0%, transparent 70%)',
        }} />
      </Box>

      <Box sx={{ overflow: 'auto', py: 2, position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, px: 2.5, mb: 4 }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: '8px',
            background: `linear-gradient(135deg, ${GOLD} 0%, #FFD95A 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <ReceiptLongIcon sx={{ color: NAVY, fontSize: 20 }} />
          </Box>
          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', letterSpacing: 0.3, lineHeight: 1.2 }}>
            Gestion des<br />Factures
          </Typography>
        </Box>

        <Typography sx={{
          color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', fontWeight: 600,
          letterSpacing: 1.5, textTransform: 'uppercase', px: 3, mb: 1,
        }}>
          Menu
        </Typography>

        <List sx={{ px: 1.5, flexGrow: 1 }}>
          {userMenuItems.map((item) => (
            <ListItem key={item.path} disablePadding sx={{ py: 0.3 }}>
              <ListItemButton component={NavLink} to={item.path} end={item.end} sx={navItemSx}>
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
                />
              </ListItemButton>
            </ListItem>
          ))}

          {/* Centre de Relance */}
          <ListItem disablePadding sx={{ py: 0.3 }}>
            <ListItemButton component={NavLink} to="/relance" sx={navItemSx}>
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                <Badge
                  badgeContent={relanceCount}
                  color="error"
                  max={99}
                  sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', minWidth: 16, height: 16 } }}
                >
                  <NotificationsActiveIcon />
                </Badge>
              </ListItemIcon>
              <ListItemText
                primary="Centre de Relance"
                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
              />
            </ListItemButton>
          </ListItem>

          {isAdmin && (
            <>
              <Box sx={{ my: 2, mx: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.08)' }} />
              <Typography sx={{
                color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', fontWeight: 600,
                letterSpacing: 1.5, textTransform: 'uppercase', px: 2, mb: 1,
              }}>
                Administration
              </Typography>
              {adminMenuItems.map((item) => (
                <ListItem key={item.path} disablePadding sx={{ py: 0.3 }}>
                  <ListItemButton component={NavLink} to={item.path} end={item.end} sx={navItemSx}>
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </>
          )}
        </List>

        {/* Bouton Deconnexion */}
        <Box sx={{ px: 1.5, pb: 2 }}>
          <Box sx={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.08)', mb: 2 }} />
          <ListItemButton
            onClick={logout}
            sx={{
              borderRadius: '10px',
              color: 'rgba(255,255,255,0.5)',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(240,180,41,0.12)',
                color: GOLD,
                '& .MuiListItemIcon-root': { color: GOLD },
              },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary={'D\u00e9connexion'}
              primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
            />
          </ListItemButton>
        </Box>
      </Box>
    </Drawer>
  );
}

export default Sidebar;
