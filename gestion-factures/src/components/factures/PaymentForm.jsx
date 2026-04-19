import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';
import * as firebaseService from '../../services/firebaseService';

const NAVY = '#0A0F2C';
const GOLD = '#F0B429';

const TYPES_VIREMENT = [
  { value: 'Virement bancaire', label: 'Virement bancaire' },
  { value: 'Chèque', label: 'Chèque' },
  { value: 'Espèces', label: 'Espèces' },
  { value: 'Mobile', label: 'Mobile' },
];

const STATUTS = [
  { value: 'EN_ATTENTE', label: 'En attente' },
  { value: 'PAYEE', label: 'Payée' },
  { value: 'REJETEE', label: 'Rejetée' },
];

const fieldSx = {
  mb: 2,
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    backgroundColor: '#fff',
    '& fieldset': { borderColor: 'rgba(10,15,44,0.12)' },
    '&:hover fieldset': { borderColor: GOLD },
    '&.Mui-focused fieldset': { borderColor: GOLD, borderWidth: '2px' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: GOLD },
};

function PaymentForm({ facture, onSuccess, userRole = 'user' }) {
  const isAdmin = userRole === 'admin';

  const schema = Yup.object({
    date_depot: Yup.date().nullable().required('La date de dépôt est obligatoire'),
    type_virement: Yup.string().required('Le type de virement est obligatoire'),
    ...(isAdmin && {
      statut: Yup.string().oneOf(['EN_ATTENTE', 'PAYEE', 'REJETEE']).required('Le statut est requis'),
      date_encaissement: Yup.date().nullable().when('statut', {
        is: 'PAYEE',
        then: (s) => s.required('La date d\'encaissement est obligatoire pour une facture payée'),
      }),
    }),
  });

  const formik = useFormik({
    initialValues: {
      date_depot: facture?.date_depot ? new Date(facture.date_depot) : null,
      type_virement: facture?.type_virement || '',
      statut: facture?.statut || 'EN_ATTENTE',
      date_encaissement: facture?.date_encaissement ? new Date(facture.date_encaissement) : null,
    },
    validationSchema: schema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const payload = {};
        // USER : date_depot + type_virement uniquement
        payload.date_depot = values.date_depot ? values.date_depot.getTime() : null;
        payload.type_virement = values.type_virement || null;
        // ADMIN : statut + date_encaissement si PAYEE
        if (isAdmin) {
          payload.statut = values.statut;
          payload.date_encaissement =
            values.statut === 'PAYEE' && values.date_encaissement
              ? values.date_encaissement.getTime()
              : null;
        }
        await firebaseService.updateFacture(facture.id, payload);
        formik.setStatus({ type: 'success', message: 'Paiement mis à jour' });
        onSuccess?.(payload);
      } catch (err) {
        formik.setStatus({ type: 'error', message: err?.message || 'Erreur lors de la mise à jour' });
      }
    },
  });

  const showStatut = isAdmin;
  const showDateEncaissement = formik.values.statut === 'PAYEE';
  const statutLabels = { EN_ATTENTE: 'En attente', PAYEE: 'Payée', REJETEE: 'Rejetée' };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
      {!isAdmin && (
        <Box sx={{ mb: 2, color: 'text.secondary', fontSize: '0.875rem' }}>
          Statut actuel : <strong>{statutLabels[facture?.statut] ?? facture?.statut ?? '—'}</strong>
        </Box>
      )}
      <form onSubmit={formik.handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <DatePicker
            label="Date de dépôt"
            value={formik.values.date_depot}
            onChange={(v) => formik.setFieldValue('date_depot', v)}
            slotProps={{
              textField: {
                fullWidth: true,
                error: !!formik.errors.date_depot,
                helperText: formik.errors.date_depot,
                sx: fieldSx,
              },
            }}
          />

          <FormControl fullWidth sx={fieldSx}>
            <InputLabel id="type-virement-label">Type de virement</InputLabel>
            <Select
              labelId="type-virement-label"
              name="type_virement"
              value={formik.values.type_virement}
              onChange={formik.handleChange}
              label="Type de virement"
              error={!!formik.errors.type_virement}
            >
              {TYPES_VIREMENT.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  {t.label}
                </MenuItem>
              ))}
            </Select>
            {formik.errors.type_virement && (
              <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5, ml: 1.5 }}>
                {formik.errors.type_virement}
              </Box>
            )}
          </FormControl>

          {showStatut && (
            <FormControl fullWidth sx={fieldSx}>
              <InputLabel id="statut-label">Statut</InputLabel>
              <Select
                labelId="statut-label"
                name="statut"
                value={formik.values.statut}
                onChange={formik.handleChange}
                label="Statut"
                error={!!formik.errors.statut}
              >
                {STATUTS.map((s) => (
                  <MenuItem key={s.value} value={s.value}>
                    {s.label}
                  </MenuItem>
                ))}
              </Select>
              {formik.errors.statut && (
                <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5, ml: 1.5 }}>
                  {formik.errors.statut}
                </Box>
              )}
            </FormControl>
          )}

          {showDateEncaissement && (
            <DatePicker
              label="Date d'encaissement"
              value={formik.values.date_encaissement}
              onChange={(v) => formik.setFieldValue('date_encaissement', v)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!formik.errors.date_encaissement,
                  helperText: formik.errors.date_encaissement,
                  sx: fieldSx,
                },
              }}
            />
          )}

          <Button
            type="submit"
            variant="contained"
            disabled={formik.isSubmitting}
            sx={{
              mt: 2,
              backgroundColor: GOLD,
              color: NAVY,
              fontWeight: 600,
              borderRadius: '10px',
              py: 1.5,
              '&:hover': { backgroundColor: '#FFD95A' },
            }}
          >
            {formik.isSubmitting ? 'Enregistrement…' : 'Mettre à jour'}
          </Button>
        </Box>
      </form>

      <Snackbar
        open={!!formik.status}
        autoHideDuration={4000}
        onClose={() => formik.setStatus(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={formik.status?.type === 'success' ? 'success' : 'error'}
          onClose={() => formik.setStatus(null)}
        >
          {formik.status?.message}
        </Alert>
      </Snackbar>
    </LocalizationProvider>
  );
}

export default PaymentForm;
