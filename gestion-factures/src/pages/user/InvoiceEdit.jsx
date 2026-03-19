import { useState, useEffect, useMemo, useCallback } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Typography,
  Button,
  TextField,
  Autocomplete,
  Select,
  MenuItem,
  FormControl,
  Paper,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableContainer,
  Snackbar,
  Alert,
  Skeleton,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import { useParams, useNavigate } from 'react-router-dom';
import ArticleRow from '../../components/factures/ArticleRow';
import { useClients } from '../../hooks/useClients';
import { useArticles } from '../../hooks/useArticles';
import { useAuth } from '../../contexts/AuthContext';
import {
  calculateMethod1,
  calculateMethod2,
  calculateMethod3,
  calculateMethod4,
  formatCurrency,
} from '../../utils/calculations';
import * as firebaseService from '../../services/firebaseService';

const NAVY = '#0A0F2C';
const GOLD = '#FB923C';

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

const METHODES = [
  { value: 1, label: 'Méthode 1 : HT + TVA globale 20%' },
  { value: 2, label: 'Méthode 2 : Remise par ligne' },
  { value: 3, label: 'Méthode 3 : Remise globale' },
  { value: 4, label: 'Méthode 4 : TVA par catégorie' },
];

const defaultArticleRow = () => ({
  _rowId: Date.now() + Math.random(),
  article_id: '',
  designation: '',
  qte: 1,
  prix_unitaire: 0,
  remise: 0,
  total_ligne: 0,
  categorie_id: null,
});

const invoiceSchema = Yup.object({
  client_id: Yup.string().required('Le client est requis'),
  articles: Yup.array()
    .of(
      Yup.object({
        article_id: Yup.mixed(),
        designation: Yup.string().required('Désignation requise').min(2, 'Min 2 caractères'),
        qte: Yup.number().min(1, 'Min 1').required('Quantité requise'),
        prix_unitaire: Yup.number().min(0, 'Prix invalide').required('Prix requis'),
      })
    )
    .min(1, "Au moins une ligne d'article est requise"),
});

function InvoiceEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, userRole } = useAuth();
  const { clients, loading: clientsLoading } = useClients();
  const { articles: articlesCatalog, categories, error: articlesError } = useArticles();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [facture, setFacture] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Load existing invoice
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!id) return;
      setLoading(true);
      setLoadError(null);
      try {
        const f = await firebaseService.getFactureById(id);
        if (cancelled) return;
        if (!f) { setLoadError('Facture introuvable'); return; }
        const isOwner = f.created_by === currentUser?.uid;
        const isAdmin = userRole === 'admin';
        if (!isOwner && !isAdmin) { setLoadError('Accès non autorisé'); return; }
        if (f.statut !== 'EN_ATTENTE') { setLoadError('Seules les factures "En attente" peuvent être modifiées'); return; }
        setFacture(f);
      } catch (err) {
        if (!cancelled) setLoadError(err?.message || 'Erreur lors du chargement');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id, currentUser?.uid, userRole]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: facture
      ? {
          client_id: facture.client_id ?? '',
          date_creation: facture.date_creation ? new Date(facture.date_creation) : new Date(),
          methode_calcul: facture.methode_calcul ?? 1,
          remise_globale: facture.remise_globale ?? 0,
          articles: (facture.articles ?? []).map((a, i) => ({
            _rowId: i,
            article_id: a.article_id ?? '',
            designation: a.designation ?? '',
            qte: a.qte ?? 1,
            prix_unitaire: a.prix_unitaire ?? 0,
            remise: a.remise ?? 0,
            total_ligne: a.total_ligne ?? 0,
            categorie_id: a.categorie_id ?? null,
          })),
        }
      : {
          client_id: '',
          date_creation: new Date(),
          methode_calcul: 1,
          remise_globale: 0,
          articles: [defaultArticleRow()],
        },
    validationSchema: invoiceSchema,
    onSubmit: async (values) => {
      if (!currentUser) {
        setSnackbar({ open: true, message: 'Vous devez être connecté', severity: 'error' });
        return;
      }
      try {
        const arts = values.articles.map(({ _rowId, ...a }) => {
          const q = Number(a.qte) || 0;
          const p = Number(a.prix_unitaire) || 0;
          const r = values.methode_calcul === 2 ? Math.min(100, Math.max(0, Number(a.remise) || 0)) : 0;
          const total_ligne = values.methode_calcul === 2 ? q * p * (1 - r / 100) : q * p;
          return { ...a, total_ligne };
        });

        const artsForCalc = arts.map((a) => ({
          qte: a.qte,
          prix_unitaire: a.prix_unitaire,
          remise: a.remise,
          categorie_id: a.categorie_id,
        }));

        let calc;
        if (values.methode_calcul === 1) calc = calculateMethod1(artsForCalc);
        else if (values.methode_calcul === 2) calc = calculateMethod2(artsForCalc);
        else if (values.methode_calcul === 3) calc = calculateMethod3(artsForCalc, values.remise_globale);
        else calc = calculateMethod4(artsForCalc, categories);

        const tvaAmount = calc.total_tva ?? calc.tva ?? 0;
        const dateCreation = values.date_creation instanceof Date
          ? values.date_creation.getTime()
          : (values.date_creation?.getTime?.() ?? Date.now());

        const updateData = {
          date_creation: dateCreation,
          client_id: values.client_id,
          articles: arts,
          methode_calcul: values.methode_calcul,
          remise_globale: values.remise_globale ?? 0,
          total_ht: calc.total_ht,
          tva: tvaAmount,
          total_ttc: calc.total_ttc,
        };

        await firebaseService.updateFacture(id, updateData);
        setSnackbar({ open: true, message: 'Facture mise à jour avec succès', severity: 'success' });
        setTimeout(() => navigate(`/factures/${id}`), 1500);
      } catch (err) {
        setSnackbar({
          open: true,
          message: err?.message || 'Erreur lors de la modification',
          severity: 'error',
        });
      }
    },
  });

  const selectedClient = clients.find((c) => c.id === formik.values.client_id);
  const showRemiseGlobale = formik.values.methode_calcul === 3;
  const methode_calcul = formik.values.methode_calcul;
  const articles = formik.values.articles;

  const pushArticle = useCallback(() => {
    formik.setFieldValue('articles', [...formik.values.articles, defaultArticleRow()]);
  }, [formik]);

  const removeArticle = useCallback((index) => {
    formik.setFieldValue(
      'articles',
      formik.values.articles.filter((_, i) => i !== index)
    );
  }, [formik]);

  const recapitulatif = useMemo(() => {
    const arts = articles.map((a) => ({
      qte: a.qte,
      prix_unitaire: a.prix_unitaire,
      remise: a.remise,
      categorie_id: a.categorie_id,
    }));
    if (methode_calcul === 1) return calculateMethod1(arts);
    if (methode_calcul === 2) return calculateMethod2(arts);
    if (methode_calcul === 3) return calculateMethod3(arts, formik.values.remise_globale);
    if (methode_calcul === 4) return calculateMethod4(arts, categories);
    return { total_ht: 0, tva: 0, total_ttc: 0 };
  }, [articles, methode_calcul, formik.values.remise_globale, categories]);

  // ── Loading state ──────────────────────────────────────────
  if (loading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={48} sx={{ mb: 2, borderRadius: '10px' }} />
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: '16px' }} />
      </Box>
    );
  }

  // ── Error state ────────────────────────────────────────────
  if (loadError) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/factures')}
          sx={{ mb: 2, color: NAVY, fontWeight: 600 }}
        >
          Retour à la liste
        </Button>
        <Alert severity="error" sx={{ borderRadius: '10px' }}>{loadError}</Alert>
      </Box>
    );
  }

  // ── Form ───────────────────────────────────────────────────
  return (
    <Box>
      {/* Back button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(`/factures/${id}`)}
        sx={{ mb: 2, color: NAVY, fontWeight: 600, '&:hover': { color: GOLD } }}
      >
        Retour à la facture
      </Button>

      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${NAVY} 0%, #141c3f 100%)`,
          borderRadius: '16px',
          px: 4, py: 3,
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          boxShadow: '0 8px 32px rgba(10,15,44,0.18)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{
          position: 'absolute', top: -40, right: -40,
          width: 180, height: 180, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(251,146,60,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <Box sx={{
          width: 48, height: 48, borderRadius: '12px',
          background: `linear-gradient(135deg, ${GOLD} 0%, #FDBA74 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <EditIcon sx={{ color: NAVY, fontSize: 24 }} />
        </Box>
        <Box>
          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.4rem', lineHeight: 1.2 }}>
            Modifier la facture
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem', mt: 0.3 }}>
            {facture?.numero}
          </Typography>
        </Box>
      </Box>

      {/* Form */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: '16px',
          border: '1px solid rgba(10,15,44,0.08)',
          boxShadow: '0 4px 24px rgba(10,15,44,0.06)',
          backgroundColor: '#fff',
        }}
      >
        {articlesError && (
          <Alert severity="warning" sx={{ mb: 2, borderRadius: '10px' }}>
            {articlesError} — Vous pouvez saisir la désignation et le prix manuellement.
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit}>
          {/* Client */}
          <Autocomplete
            options={clients}
            getOptionLabel={(option) => option?.nom ?? ''}
            value={selectedClient ?? null}
            onChange={(_, value) => formik.setFieldValue('client_id', value?.id ?? '')}
            loading={clientsLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Client *"
                placeholder="Rechercher un client..."
                error={formik.touched.client_id && Boolean(formik.errors.client_id)}
                helperText={formik.touched.client_id && formik.errors.client_id}
                sx={fieldSx}
              />
            )}
            sx={{ mb: 2 }}
          />

          {/* Date */}
          <DatePicker
            label="Date de création"
            value={formik.values.date_creation}
            onChange={(date) => formik.setFieldValue('date_creation', date ?? new Date())}
            slotProps={{ textField: { fullWidth: true, sx: fieldSx } }}
          />

          {/* Méthode de calcul */}
          <FormControl fullWidth sx={{ ...fieldSx, mt: 2 }}>
            <Select
              name="methode_calcul"
              value={formik.values.methode_calcul}
              onChange={formik.handleChange}
              sx={{
                borderRadius: '10px',
                backgroundColor: '#fff',
                '& fieldset': { borderColor: 'rgba(10,15,44,0.12)' },
                '&:hover fieldset': { borderColor: GOLD },
                '&.Mui-focused fieldset': { borderColor: GOLD, borderWidth: '2px' },
              }}
            >
              {METHODES.map((m) => (
                <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Remise globale */}
          {showRemiseGlobale && (
            <TextField
              fullWidth
              name="remise_globale"
              type="number"
              label="Remise globale (%)"
              value={formik.values.remise_globale}
              onChange={formik.handleChange}
              inputProps={{ min: 0, max: 100, step: 0.5 }}
              sx={fieldSx}
            />
          )}

          {/* Lignes d'articles */}
          <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(10,15,44,0.08)' }}>
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography sx={{ fontWeight: 600, color: NAVY, fontSize: '1rem' }}>
                  Lignes d'articles
                </Typography>
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={pushArticle}
                  sx={{
                    borderRadius: '8px',
                    borderColor: GOLD,
                    color: GOLD,
                    '&:hover': { borderColor: GOLD, backgroundColor: 'rgba(251,146,60,0.08)' },
                  }}
                >
                  Ajouter un article
                </Button>
              </Box>

              <TableContainer sx={{ borderRadius: '12px', border: '1px solid rgba(10,15,44,0.08)' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'rgba(10,15,44,0.04)' }}>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: NAVY }}>Article</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: NAVY, width: 90 }}>Qté</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: NAVY, width: 120 }}>Prix unit.</TableCell>
                      {methode_calcul === 2 && (
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: NAVY, width: 90 }}>Remise %</TableCell>
                      )}
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: NAVY, minWidth: 110 }}>Total ligne</TableCell>
                      <TableCell sx={{ width: 56 }} />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formik.values.articles.map((field, index) => (
                      <ArticleRow
                        key={field._rowId ?? index}
                        index={index}
                        field={field}
                        remove={() => removeArticle(index)}
                        articlesCatalog={articlesCatalog}
                        methode_calcul={methode_calcul}
                        setFieldValue={formik.setFieldValue}
                        handleChange={formik.handleChange}
                        handleBlur={formik.handleBlur}
                        canRemove={formik.values.articles.length > 1}
                        error={Array.isArray(formik.errors.articles) ? formik.errors.articles[index] : null}
                      />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>

            {formik.touched.articles && formik.errors.articles && (
              <Typography sx={{ color: '#e53e3e', fontSize: '0.78rem', mt: 1 }}>
                {typeof formik.errors.articles === 'string'
                  ? formik.errors.articles
                  : 'Vérifiez les champs (désignation, quantité, prix) pour chaque ligne'}
              </Typography>
            )}
          </Box>

          {/* Récapitulatif */}
          <Box sx={{ mt: 4, p: 3, borderRadius: '12px', backgroundColor: 'rgba(10,15,44,0.03)', border: '1px solid rgba(10,15,44,0.06)' }}>
            <Typography sx={{ fontWeight: 700, color: NAVY, mb: 2, fontSize: '1rem' }}>Récapitulatif</Typography>

            {methode_calcul === 1 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography>Total HT : {formatCurrency(recapitulatif.total_ht)}</Typography>
                <Typography>TVA (20%) : {formatCurrency(recapitulatif.tva)}</Typography>
                <Typography sx={{ fontWeight: 700, color: GOLD, mt: 1 }}>Total TTC : {formatCurrency(recapitulatif.total_ttc)}</Typography>
              </Box>
            )}
            {methode_calcul === 2 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography>Total HT : {formatCurrency(recapitulatif.total_ht)}</Typography>
                <Typography>TVA (20%) : {formatCurrency(recapitulatif.tva)}</Typography>
                <Typography sx={{ fontWeight: 700, color: GOLD, mt: 1 }}>Total TTC : {formatCurrency(recapitulatif.total_ttc)}</Typography>
              </Box>
            )}
            {methode_calcul === 3 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography>Total HT : {formatCurrency(recapitulatif.total_ht)}</Typography>
                <Typography>Remise : -{formatCurrency(recapitulatif.remise_montant)}</Typography>
                <Typography>Base TVA : {formatCurrency(recapitulatif.base_tva)}</Typography>
                <Typography>TVA (20%) : {formatCurrency(recapitulatif.tva)}</Typography>
                <Typography sx={{ fontWeight: 700, color: GOLD, mt: 1 }}>Total TTC : {formatCurrency(recapitulatif.total_ttc)}</Typography>
              </Box>
            )}
            {methode_calcul === 4 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {recapitulatif.tva_details?.map((d) => (
                  <Box key={d.nom} sx={{ display: 'flex', gap: 1 }}>
                    <Typography>HT {d.nom} : {formatCurrency(d.ht)}</Typography>
                    <Typography>TVA {d.taux * 100}% : {formatCurrency(d.tva)}</Typography>
                  </Box>
                ))}
                <Typography sx={{ fontWeight: 600, mt: 1 }}>Total HT : {formatCurrency(recapitulatif.total_ht)}</Typography>
                <Typography>TVA totale : {formatCurrency(recapitulatif.total_tva)}</Typography>
                <Typography sx={{ fontWeight: 700, color: GOLD, mt: 1 }}>Total TTC : {formatCurrency(recapitulatif.total_ttc)}</Typography>
              </Box>
            )}
          </Box>

          {/* Actions */}
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              type="button"
              onClick={() => navigate(`/factures/${id}`)}
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
              startIcon={<EditIcon />}
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
              }}
            >
              {formik.isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </Box>
        </form>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%', borderRadius: '10px' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default InvoiceEdit;
