import { NavLink } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import LogoutIcon from '@mui/icons-material/Logout';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useAuth } from '../../contexts/AuthContext';

const DRAWER_WIDTH = 260;

const userMenuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { path: '/clients', label: 'Clients', icon: <PeopleIcon /> },
  { path: '/factures', label: 'Factures', icon: <DescriptionIcon /> },
];

const adminMenuItems = [
  { path: '/admin', label: 'Dashboard Admin', icon: <AdminPanelSettingsIcon /> },
  { path: '/admin/articles', label: 'Articles', icon: <InventoryIcon /> },
  { path: '/admin/categories', label: 'Catégories', icon: <CategoryIcon /> },
  { path: '/admin/validation', label: 'Validation factures', icon: <CheckCircleIcon /> },
];

function Sidebar() {
  const { userRole, logout } = useAuth();
  const isAdmin = userRole === 'admin';

  const handleLogout = () => {
    logout();
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: '#1E3A5F',
          color: 'rgba(255,255,255,0.9)',
          borderRight: 'none',
        },
      }}
    >
      <Box sx={{ overflow: 'auto', py: 2 }}>
        <List>
          {userMenuItems.map((item) => (
            <ListItem key={item.path} disablePadding sx={{ px: 1.5, py: 0.5 }}>
              <ListItemButton
                component={NavLink}
                to={item.path}
                sx={{
                  borderRadius: 1,
                  '&.active': {
                    backgroundColor: 'rgba(33, 150, 243, 0.2)',
                    color: '#2196F3',
                    '& .MuiListItemIcon-root': { color: '#2196F3' },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.08)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
          {isAdmin && (
            <>
              <ListItem disablePadding sx={{ px: 1.5, py: 0.5, mt: 1 }}>
                <ListItemText
                  primary="Administration"
                  sx={{
                    fontSize: '0.75rem',
                    color: 'rgba(255,255,255,0.5)',
                    px: 2,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}
                />
              </ListItem>
              {adminMenuItems.map((item) => (
                <ListItem key={item.path} disablePadding sx={{ px: 1.5, py: 0.5 }}>
                  <ListItemButton
                    component={NavLink}
                    to={item.path}
                    sx={{
                      borderRadius: 1,
                      '&.active': {
                        backgroundColor: 'rgba(33, 150, 243, 0.2)',
                        color: '#2196F3',
                        '& .MuiListItemIcon-root': { color: '#2196F3' },
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.08)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                </ListItem>
              ))}
            </>
          )}
          <ListItem disablePadding sx={{ px: 1.5, py: 0.5, mt: 2 }}>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                borderRadius: 1,
                color: 'rgba(255,255,255,0.7)',
                '&:hover': {
                  backgroundColor: 'rgba(244, 67, 54, 0.2)',
                  color: '#f44336',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Déconnexion" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
}

export default Sidebar;
export { DRAWER_WIDTH };
