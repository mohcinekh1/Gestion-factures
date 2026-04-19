import { useMemo } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';

const NAVY = '#0A0F2C';
const GOLD = '#F0B429';
const TEXT_DARK = '#1A1F36';

const fieldSx = {
  mb: 2,
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: '10px',
    fontSize: '0.9rem',
    color: TEXT_DARK,
    '& input': { py: '11px', px: '14px' },
    '& textarea': { px: '14px' },
    '& fieldset': { borderColor: '#E2E5EF' },
    '&:hover fieldset': { borderColor: GOLD },
    '&.Mui-focused fieldset': { borderColor: GOLD, borderWidth: '2px' },
  },
  '& .MuiInputLabel-root': { color: '#8A94A6', fontSize: '0.9rem' },
  '& .MuiInputLabel-root.Mui-focused': { color: GOLD },
  '& .MuiFormHelperText-root': { color: '#e53e3e', mt: 0.5, fontSize: '0.78rem' },
};

function getValidationSchema(clients, editingClientId) {
  return Yup.object({
    nom: Yup.string()
      .required('Le nom est requis')
      .min(2, 'Le nom doit contenir au moins 2 caractères'),
    email: Yup.string()
      .required("L'email est requis")
      .email("Format d'email invalide")
      .test('unique', 'Cet email est déjà utilisé par un autre client', (val) => {
        if (!val) return true;
        const others = clients.filter((c) => c.id !== editingClientId);
        return !others.some((c) => c.email?.toLowerCase() === val?.toLowerCase());
      }),
    tel: Yup.string()
      .required('Le téléphone est requis')
      .matches(/^[0-9\s\-\+\.]{6,20}$/, 'Format de téléphone invalide'),
    adresse: Yup.string().required("L'adresse est requise"),
  });
}

export default function ClientForm({ open, onClose, client, onSubmit, clients = [] }) {
  const isEdit = Boolean(client);

  const validationSchema = useMemo(
    () => getValidationSchema(clients, client?.id),
    [clients, client?.id]
  );

  const formik = useFormik({
    initialValues: {
      nom: client?.nom ?? '',
      email: client?.email ?? '',
      tel: client?.tel ?? '',
      adresse: client?.adresse ?? '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        await onSubmit(values);
        onClose();
      } catch {
        // Erreur gérée par le parent (useClients)
      }
    },
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          boxShadow: '0 24px 60px rgba(10,15,44,0.2)',
          overflow: 'hidden',
        },
      }}
    >
      <form onSubmit={formik.handleSubmit}>
        {/* En-tête Navy */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${NAVY} 0%, #141c3f 100%)`,
            px: 3, py: 2.5,
            display: 'flex', alignItems: 'center', gap: 1.5,
            position: 'relative', overflow: 'hidden',
          }}
        >
          <Box sx={{
            position: 'absolute', top: -30, right: -30,
            width: 120, height: 120, borderRadius: '50%',
            background: `radial-gradient(circle, rgba(240,180,41,0.12) 0%, transparent 70%)`,
            pointerEvents: 'none',
          }} />
          <Box sx={{
            width: 38, height: 38, borderRadius: '9px',
            background: `linear-gradient(135deg, #C89A1A 0%, #F0B429 35%, #FFD95A 65%, #F0B429 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            {isEdit
              ? <EditIcon sx={{ color: NAVY, fontSize: 18 }} />
              : <PersonAddIcon sx={{ color: NAVY, fontSize: 18 }} />
            }
          </Box>
          <Box>
            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.2 }}>
              {isEdit ? 'Modifier le client' : 'Nouveau client'}
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', mt: 0.2 }}>
              {isEdit ? 'Mettez à jour les informations' : 'Remplissez les informations du client'}
            </Typography>
          </Box>
        </Box>

        {/* Contenu formulaire */}
        <DialogContent sx={{ px: 3, py: 3, backgroundColor: '#F8F9FC' }}>
          <Box>
            <TextField
              fullWidth
              name="nom"
              label="Nom complet *"
              value={formik.values.nom}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.nom && Boolean(formik.errors.nom)}
              helperText={formik.touched.nom && formik.errors.nom}
              sx={fieldSx}
            />
            <TextField
              fullWidth
              name="email"
              type="email"
              label="Adresse email *"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              sx={fieldSx}
            />
            <TextField
              fullWidth
              name="tel"
              label="Téléphone *"
              value={formik.values.tel}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.tel && Boolean(formik.errors.tel)}
              helperText={formik.touched.tel && formik.errors.tel}
              sx={fieldSx}
            />
            <TextField
              fullWidth
              name="adresse"
              label="Adresse *"
              value={formik.values.adresse}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.adresse && Boolean(formik.errors.adresse)}
              helperText={formik.touched.adresse && formik.errors.adresse}
              multiline
              rows={2}
              sx={{ ...fieldSx, mb: 0 }}
            />
          </Box>
        </DialogContent>

        {/* Actions */}
        <DialogActions sx={{ px: 3, py: 2.5, backgroundColor: '#F8F9FC', borderTop: '1px solid rgba(10,15,44,0.07)', gap: 1 }}>
          <Button
            type="button"
            onClick={onClose}
            sx={{
              color: '#8A94A6', fontWeight: 600, borderRadius: '8px',
              border: '1px solid rgba(10,15,44,0.12)', px: 2.5,
              '&:hover': { backgroundColor: 'rgba(10,15,44,0.04)' },
            }}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={formik.isSubmitting}
            sx={{
              py: 1.1, px: 3,
              borderRadius: '8px',
              backgroundColor: NAVY,
              color: GOLD,
              fontWeight: 700,
              fontSize: '0.875rem',
              letterSpacing: 0.8,
              boxShadow: '0 4px 16px rgba(10,15,44,0.25)',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: '#141c3f',
                boxShadow: '0 6px 24px rgba(10,15,44,0.4)',
                transform: 'translateY(-1px)',
              },
              '&.Mui-disabled': { opacity: 0.6, color: GOLD },
            }}
          >
            {formik.isSubmitting
              ? 'Enregistrement...'
              : isEdit ? 'Enregistrer' : 'Ajouter le client'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
