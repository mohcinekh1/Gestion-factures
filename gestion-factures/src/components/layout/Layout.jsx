import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { DRAWER_WIDTH } from './Sidebar';

function Layout() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: `calc(100% - ${DRAWER_WIDTH}px)`,
          backgroundColor: 'background.default',
        }}
      >
        <Navbar />
        <Box sx={{ p: 3, mt: '64px' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default Layout;
