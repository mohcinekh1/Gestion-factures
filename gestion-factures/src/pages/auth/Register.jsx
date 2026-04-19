import { useState } from 'react';
import { useNavigate, Link as RouterLink, Navigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  IconButton,
  InputAdornment,
} from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../../contexts/AuthContext';
import BeamsBackground from '../../components/common/BeamsBackground';

const NAVY = '#0A0F2C';
const GOLD = '#F0B429';
const TEXT_DARK = '#1A1F36';

const validationSchema = Yup.object({
  nom: Yup.string().min(2, 'Le nom doit contenir au moins 2 caractères').required('Le nom est requis'),
  email: Yup.string().email('Email invalide').required("L'email est requis"),
  password: Yup.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères').required('Le mot de passe est requis'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Les mots de passe ne correspondent pas')
    .required('Confirmez le mot de passe'),
});

const fieldSx = {
  mb: 2,
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: '10px',
    fontSize: '0.9rem',
    color: TEXT_DARK,
    '& input': { py: '11px', px: '14px' },
    '& fieldset': { borderColor: '#E2E5EF' },
    '&:hover fieldset': { borderColor: GOLD },
    '&.Mui-focused fieldset': { borderColor: GOLD, borderWidth: '2px' },
  },
  '& .MuiInputLabel-root': { color: '#8A94A6', fontSize: '0.9rem' },
  '& .MuiInputLabel-root.Mui-focused': { color: GOLD },
  '& .MuiFormHelperText-root': { color: '#e53e3e', mt: 0.5, fontSize: '0.78rem' },
};


function Register() {
  const navigate = useNavigate();
  const { register, currentUser } = useAuth();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const formik = useFormik({
    initialValues: { nom: '', email: '', password: '', confirmPassword: '' },
    validationSchema,
    onSubmit: async (values) => {
      setError('');
      try {
        await register(values.email, values.password, values.nom);
        navigate('/dashboard');
      } catch (err) {
        const code = err?.code || '';
        if (code === 'auth/email-already-in-use') setError('Cet email est déjà utilisé');
        else if (code === 'auth/weak-password') setError('Le mot de passe est trop faible');
        else if (code === 'auth/invalid-email') setError("Format d'email invalide");
        else setError(err?.message || 'Une erreur est survenue');
      }
    },
  });

  if (currentUser) return <Navigate to="/dashboard" replace />;

  return (
    <BeamsBackground intensity="strong">
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          maxWidth: 900,
          mx: 3,
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
          minHeight: { xs: 'auto', md: 580 },
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        {/* ── PANNEAU GAUCHE (55%) ── */}
        <Box
          sx={{
            flex: { xs: '0 0 auto', md: '0 0 55%' },
            background: 'rgba(255, 255, 255, 0.10)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            p: { xs: 3, md: 5 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Décoration géométrique */}
          <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            <Box sx={{
              position: 'absolute', top: -80, right: -80,
              width: 280, height: 280, borderRadius: '50%',
              background: `radial-gradient(circle, rgba(240,180,41,0.12) 0%, transparent 70%)`,
            }} />
            <Box sx={{
              position: 'absolute', bottom: -60, left: -60,
              width: 220, height: 220, borderRadius: '50%',
              background: `radial-gradient(circle, rgba(26,39,80,0.6) 0%, transparent 70%)`,
            }} />
            {[...Array(5)].map((_, row) =>
              [...Array(6)].map((_, col) => (
                <Box key={`${row}-${col}`} sx={{
                  position: 'absolute',
                  top: 60 + row * 70, left: 20 + col * 70,
                  width: 3, height: 3, borderRadius: '50%',
                  backgroundColor: 'rgba(240,180,41,0.18)',
                }} />
              ))
            )}
          </Box>

          {/* Logo */}
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: { xs: 3, md: 6 } }}>
              <Box sx={{
                width: 36, height: 36, borderRadius: '8px',
                background: `linear-gradient(135deg, #C89A1A 0%, #F0B429 35%, #FFD95A 65%, #F0B429 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ReceiptLongIcon sx={{ color: NAVY, fontSize: 20 }} />
              </Box>
              <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1rem', letterSpacing: 0.3 }}>
                Gestion des Factures
              </Typography>
            </Box>

            <Typography
              variant="h4"
              sx={{
                color: '#fff', fontWeight: 700, lineHeight: 1.25,
                fontSize: { xs: '1.6rem', md: '2rem' }, mb: 2,
              }}
            >
              Rejoignez-nous,
              <br />
              <Box component="span" sx={{ color: GOLD }}>c'est gratuit.</Box>
            </Typography>

            <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: 300 }}>
              Créez votre compte en quelques secondes et commencez à gérer vos factures professionnellement.
            </Typography>
          </Box>

        </Box>

        {/* ── PANNEAU DROIT (45%) ── */}
        <Box
          sx={{
            flex: { xs: '0 0 auto', md: '0 0 45%' },
            background: 'rgba(248, 249, 252, 0.92)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            p: { xs: 3, md: 5 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h5" sx={{ color: TEXT_DARK, fontWeight: 700, mb: 0.5, fontSize: '1.5rem' }}>
            Créer un compte
          </Typography>
          <Typography sx={{ color: '#8A94A6', fontSize: '0.875rem', mb: 3 }}>
            Commencez gratuitement, sans carte bancaire
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '10px', fontSize: '0.85rem' }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <form onSubmit={formik.handleSubmit}>
            {/* Nom */}
            <TextField
              fullWidth id="nom" name="nom"
              label="Nom complet"
              value={formik.values.nom}
              onChange={formik.handleChange} onBlur={formik.handleBlur}
              error={formik.touched.nom && Boolean(formik.errors.nom)}
              helperText={formik.touched.nom && formik.errors.nom}
              autoComplete="name"
              sx={fieldSx}
            />

            {/* Email */}
            <TextField
              fullWidth id="email" name="email"
              label="Adresse email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange} onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              autoComplete="email"
              sx={fieldSx}
            />

            {/* Password */}
            <TextField
              fullWidth id="password" name="password"
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              value={formik.values.password}
              onChange={formik.handleChange} onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((v) => !v)} edge="end" size="small" sx={{ color: '#8A94A6', '&:hover': { color: GOLD } }}>
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
            />

            {/* Confirm Password */}
            <TextField
              fullWidth id="confirmPassword" name="confirmPassword"
              label="Confirmer le mot de passe"
              type={showConfirm ? 'text' : 'password'}
              value={formik.values.confirmPassword}
              onChange={formik.handleChange} onBlur={formik.handleBlur}
              error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
              helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirm((v) => !v)} edge="end" size="small" sx={{ color: '#8A94A6', '&:hover': { color: GOLD } }}>
                      {showConfirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ ...fieldSx, mb: 2.5 }}
            />

            {/* CTA */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={formik.isSubmitting}
              sx={{
                py: 1.4,
                borderRadius: '10px',
                backgroundColor: NAVY,
                color: GOLD,
                fontWeight: 700,
                fontSize: '0.9rem',
                letterSpacing: 1.2,
                boxShadow: '0 4px 16px rgba(10,15,44,0.3)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: '#141c3f',
                  boxShadow: '0 8px 28px rgba(10,15,44,0.45)',
                  transform: 'translateY(-1px)',
                },
                '&.Mui-disabled': { opacity: 0.6, color: GOLD },
              }}
            >
              {formik.isSubmitting ? 'Création...' : "CRÉER MON COMPTE"}
            </Button>
          </form>

          {/* Lien login */}
          <Typography sx={{ color: '#8A94A6', fontSize: '0.82rem', textAlign: 'center', mt: 3 }}>
            Déjà un compte ?{' '}
            <Link
              component={RouterLink} to="/login"
              sx={{ color: NAVY, fontWeight: 700, textDecoration: 'none', '&:hover': { color: GOLD, textDecoration: 'underline' } }}
            >
              Se connecter
            </Link>
          </Typography>
        </Box>
      </Box>
    </BeamsBackground>
  );
}

export default Register;
