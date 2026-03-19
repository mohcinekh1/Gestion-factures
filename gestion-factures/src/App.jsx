import { ThemeProvider, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { theme } from './theme/theme';
import { AuthProvider } from './contexts/AuthContext';
import * as firebaseService from './services/firebaseService';
import * as jsonService from './services/jsonService';

// Expose services in console for testing (phase 3.1 & 3.2)
if (import.meta.env.DEV) {
  window.firebaseService = firebaseService;
  window.jsonService = jsonService;
}
import PrivateRoute from './routes/PrivateRoute';
import AdminRoute from './routes/AdminRoute';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import UserDashboard from './pages/user/UserDashboard';
import ClientsList from './pages/user/ClientsList';
import InvoicesList from './pages/user/InvoicesList';
import InvoiceCreate from './pages/user/InvoiceCreate';
import InvoiceDetail from './pages/user/InvoiceDetail';
import InvoiceEdit from './pages/user/InvoiceEdit';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminArticles from './pages/admin/AdminArticles';
import AdminCategories from './pages/admin/AdminCategories';
import AdminValidation from './pages/admin/AdminValidation';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
      <BrowserRouter>
        <AuthProvider>
          <CssBaseline />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<PrivateRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/clients" element={<ClientsList />} />
                <Route path="/factures" element={<InvoicesList />} />
                <Route path="/factures/nouvelle" element={<InvoiceCreate />} />
                <Route path="/factures/:id/modifier" element={<InvoiceEdit />} />
                <Route path="/factures/:id" element={<InvoiceDetail />} />
              </Route>
              <Route path="/admin" element={<AdminRoute />}>
                <Route element={<Layout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="articles" element={<AdminArticles />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="validation" element={<AdminValidation />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;