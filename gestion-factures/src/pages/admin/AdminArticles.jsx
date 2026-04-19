import { useState, useMemo } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  DialogContentText,
  Skeleton,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  FormHelperText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InventoryIcon from '@mui/icons-material/Inventory';
import { useArticles } from '../../hooks/useArticles';

const NAVY = '#0A0F2C';
const GOLD = '#F0B429';
const TEXT_DARK = '#1A1F36';

const TVA_BY_CATEGORY = {
  Informatique: '20%',
  Services: '10%',
  Formation: '0%',
};

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

const selectSx = {
  borderRadius: '10px',
  fontSize: '0.9rem',
  backgroundColor: 'rgba(255,255,255,0.7)',
  color: TEXT_DARK,
  '& fieldset': { borderColor: '#E2E5EF' },
  '&:hover fieldset': { borderColor: GOLD },
  '&.Mui-focused fieldset': { borderColor: GOLD, borderWidth: '2px' },
};

function formatMAD(value) {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 2,
  }).format(value);
}

const articleSchema = Yup.object({
  designation: Yup.string()
    .required('La désignation est requise')
    .min(2, 'La désignation doit contenir au moins 2 caractères'),
  prix_unitaire: Yup.number()
    .typeError('Le prix doit être un nombre')
    .required('Le prix unitaire est requis')
    .positive('Le prix doit être positif'),
  categorie_id: Yup.number()
    .required('La catégorie est requise')
    .typeError('Veuillez sélectionner une catégorie'),
});

function ArticleForm({ open, onClose, article, categories, onSubmit }) {
  const isEdit = Boolean(article);

  const formik = useFormik({
    initialValues: {
      designation: article?.designation ?? '',
      prix_unitaire: article?.prix_unitaire ?? '',
      categorie_id: article?.categorie_id ?? '',
    },
    validationSchema: articleSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await onSubmit({
          ...values,
          prix_unitaire: Number(values.prix_unitaire),
          categorie_id: Number(values.categorie_id),
        });
        onClose();
      } finally {
        setSubmitting(false);
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
              : <AddIcon sx={{ color: NAVY, fontSize: 18 }} />
            }
          </Box>
          <Box>
            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.2 }}>
              {isEdit ? "Modifier l'article" : 'Nouvel article'}
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', mt: 0.2 }}>
              {isEdit ? "Mettez à jour les informations" : "Remplissez les informations de l'article"}
            </Typography>
          </Box>
        </Box>

        <DialogContent sx={{ px: 3, py: 3, backgroundColor: '#F8F9FC' }}>
          <TextField
            fullWidth
            name="designation"
            label="Désignation *"
            value={formik.values.designation}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.designation && Boolean(formik.errors.designation)}
            helperText={formik.touched.designation && formik.errors.designation}
            sx={fieldSx}
          />

          <TextField
            fullWidth
            name="prix_unitaire"
            label="Prix unitaire (MAD) *"
            type="number"
            inputProps={{ min: 0, step: '0.01' }}
            value={formik.values.prix_unitaire}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.prix_unitaire && Boolean(formik.errors.prix_unitaire)}
            helperText={formik.touched.prix_unitaire && formik.errors.prix_unitaire}
            sx={fieldSx}
          />

          <FormControl
            fullWidth
            error={formik.touched.categorie_id && Boolean(formik.errors.categorie_id)}
            sx={{ mb: 0 }}
          >
            <InputLabel sx={{ color: '#8A94A6', fontSize: '0.9rem', '&.Mui-focused': { color: GOLD } }}>
              Catégorie *
            </InputLabel>
            <Select
              name="categorie_id"
              value={formik.values.categorie_id}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              label="Catégorie *"
              sx={selectSx}
            >
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.nom}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.categorie_id && formik.errors.categorie_id && (
              <FormHelperText sx={{ color: '#e53e3e', fontSize: '0.78rem' }}>
                {formik.errors.categorie_id}
              </FormHelperText>
            )}
          </FormControl>
        </DialogContent>

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
              : isEdit ? 'Enregistrer' : "Ajouter l'article"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

function AdminArticles() {
  const { articles, categories, loading, error, addArticle, updateArticle, deleteArticle } = useArticles();
  const [filterCatId, setFilterCatId] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);

  const getCategoryName = (categorieId) => {
    const cat = categories.find((c) => c.id === categorieId);
    return cat ? cat.nom : '—';
  };

  const filteredArticles = useMemo(() => {
    if (!filterCatId) return articles;
    return articles.filter((a) => a.categorie_id === Number(filterCatId));
  }, [articles, filterCatId]);

  const handleOpenAdd = () => { setEditingArticle(null); setFormOpen(true); };
  const handleOpenEdit = (article) => { setEditingArticle(article); setFormOpen(true); };
  const handleCloseForm = () => { setFormOpen(false); setEditingArticle(null); };

  const handleFormSubmit = async (values) => {
    if (editingArticle) {
      await updateArticle(editingArticle.id, values);
    } else {
      await addArticle(values);
    }
  };

  const handleOpenDelete = (article) => { setArticleToDelete(article); setDeleteDialogOpen(true); };
  const handleCloseDelete = () => { setDeleteDialogOpen(false); setArticleToDelete(null); };
  const handleConfirmDelete = async () => {
    if (articleToDelete) {
      await deleteArticle(articleToDelete.id);
      handleCloseDelete();
    }
  };

  if (loading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={88} sx={{ mb: 3, borderRadius: '16px' }} />
        <Skeleton variant="rectangular" height={56} sx={{ mb: 2, borderRadius: '10px' }} />
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: '16px' }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* En-tête */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${NAVY} 0%, #141c3f 100%)`,
          borderRadius: '16px',
          px: 4, py: 3,
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          boxShadow: '0 8px 32px rgba(10,15,44,0.18)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{
          position: 'absolute', top: -40, right: -40,
          width: 180, height: 180, borderRadius: '50%',
          background: `radial-gradient(circle, rgba(240,180,41,0.12) 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            width: 48, height: 48, borderRadius: '12px',
            background: `linear-gradient(135deg, #C89A1A 0%, #F0B429 35%, #FFD95A 65%, #F0B429 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <InventoryIcon sx={{ color: NAVY, fontSize: 24 }} />
          </Box>
          <Box>
            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.4rem', lineHeight: 1.2 }}>
              Articles
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem', mt: 0.3 }}>
              {articles.length} article{articles.length !== 1 ? 's' : ''} enregistré{articles.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          sx={{
            backgroundColor: GOLD,
            color: NAVY,
            fontWeight: 700,
            fontSize: '0.85rem',
            letterSpacing: 0.8,
            borderRadius: '10px',
            px: 2.5, py: 1.1,
            boxShadow: `0 4px 16px rgba(240,180,41,0.35)`,
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: '#FFD95A',
              boxShadow: `0 6px 24px rgba(240,180,41,0.5)`,
              transform: 'translateY(-1px)',
            },
          }}
        >
          Nouvel article
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>
          {error}
        </Alert>
      )}

      {/* Filtre par catégorie */}
      <FormControl size="small" sx={{ mb: 2.5, minWidth: 240 }}>
        <InputLabel sx={{ fontSize: '0.875rem' }}>Filtrer par catégorie</InputLabel>
        <Select
          value={filterCatId}
          onChange={(e) => setFilterCatId(e.target.value)}
          label="Filtrer par catégorie"
          sx={{
            borderRadius: '10px',
            backgroundColor: '#fff',
            fontSize: '0.875rem',
            '& fieldset': { borderColor: 'rgba(10,15,44,0.12)' },
            '&:hover fieldset': { borderColor: GOLD },
            '&.Mui-focused fieldset': { borderColor: GOLD, borderWidth: '2px' },
          }}
        >
          <MenuItem value="">Toutes les catégories</MenuItem>
          {categories.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>{cat.nom}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Tableau */}
      <TableContainer
        sx={{
          borderRadius: '16px',
          border: '1px solid rgba(10,15,44,0.08)',
          boxShadow: '0 4px 24px rgba(10,15,44,0.06)',
          backgroundColor: '#fff',
          overflow: 'hidden',
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                background: `linear-gradient(90deg, ${NAVY} 0%, #141c3f 100%)`,
                '& .MuiTableCell-root': {
                  color: 'rgba(255,255,255,0.7)',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  borderBottom: 'none',
                  py: 2,
                },
              }}
            >
              <TableCell>Désignation</TableCell>
              <TableCell>Prix unitaire</TableCell>
              <TableCell>Catégorie</TableCell>
              <TableCell>TVA</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredArticles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <InventoryIcon sx={{ fontSize: 40, color: 'rgba(10,15,44,0.12)', mb: 1, display: 'block', mx: 'auto' }} />
                  <Typography sx={{ color: '#8A94A6', fontSize: '0.875rem' }}>
                    {articles.length === 0
                      ? 'Aucun article. Cliquez sur "Nouvel article" pour commencer.'
                      : 'Aucun article dans cette catégorie.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredArticles.map((article, index) => {
                const catName = getCategoryName(article.categorie_id);
                const tva = TVA_BY_CATEGORY[catName] ?? '—';
                return (
                  <TableRow
                    key={article.id}
                    sx={{
                      backgroundColor: index % 2 === 0 ? '#fff' : 'rgba(10,15,44,0.018)',
                      transition: 'background-color 0.15s ease',
                      '&:hover': { backgroundColor: `rgba(240,180,41,0.06)` },
                      '& .MuiTableCell-root': {
                        borderBottom: '1px solid rgba(10,15,44,0.06)',
                        py: 1.8,
                        fontSize: '0.875rem',
                        color: '#1A1F36',
                      },
                    }}
                  >
                    <TableCell>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: NAVY }}>
                        {article.designation}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={formatMAD(article.prix_unitaire)}
                        size="small"
                        sx={{
                          backgroundColor: `rgba(240,180,41,0.12)`,
                          color: '#7c2d12',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          height: 24,
                          borderRadius: '6px',
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={catName}
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(10,15,44,0.06)',
                          color: NAVY,
                          fontSize: '0.78rem',
                          fontWeight: 500,
                          height: 24,
                          borderRadius: '6px',
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontSize: '0.82rem', color: '#4A5568', fontWeight: 500 }}>
                        {tva}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEdit(article)}
                          title="Modifier"
                          sx={{
                            color: NAVY,
                            backgroundColor: 'rgba(10,15,44,0.05)',
                            borderRadius: '8px',
                            width: 32, height: 32,
                            '&:hover': {
                              backgroundColor: `rgba(240,180,41,0.15)`,
                              color: GOLD,
                            },
                          }}
                        >
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDelete(article)}
                          title="Supprimer"
                          sx={{
                            color: '#e53e3e',
                            backgroundColor: 'rgba(229,62,62,0.06)',
                            borderRadius: '8px',
                            width: 32, height: 32,
                            '&:hover': {
                              backgroundColor: 'rgba(229,62,62,0.15)',
                              color: '#c53030',
                            },
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <ArticleForm
        open={formOpen}
        onClose={handleCloseForm}
        article={editingArticle}
        categories={categories}
        onSubmit={handleFormSubmit}
      />

      {/* Dialog de suppression */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDelete}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 24px 60px rgba(10,15,44,0.2)',
            maxWidth: 420,
            width: '100%',
            overflow: 'hidden',
          },
        }}
      >
        <Box sx={{
          background: `linear-gradient(135deg, ${NAVY} 0%, #141c3f 100%)`,
          px: 3, py: 2.5,
          display: 'flex', alignItems: 'center', gap: 1.5,
        }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: '8px',
            backgroundColor: 'rgba(229,62,62,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <DeleteIcon sx={{ color: '#fc8181', fontSize: 18 }} />
          </Box>
          <DialogTitle sx={{ p: 0, color: '#fff', fontWeight: 700, fontSize: '1.05rem' }}>
            Supprimer l'article
          </DialogTitle>
        </Box>

        <DialogContent sx={{ px: 3, py: 2.5 }}>
          <DialogContentText sx={{ color: '#4A5568', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Êtes-vous sûr de vouloir supprimer l'article{' '}
            <Box component="span" sx={{ fontWeight: 700, color: NAVY }}>
              « {articleToDelete?.designation} »
            </Box>
            {' '}? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={handleCloseDelete}
            sx={{
              color: '#8A94A6', fontWeight: 600, borderRadius: '8px',
              border: '1px solid rgba(10,15,44,0.12)',
              px: 2.5,
              '&:hover': { backgroundColor: 'rgba(10,15,44,0.04)' },
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            sx={{
              backgroundColor: '#e53e3e',
              fontWeight: 700, borderRadius: '8px', px: 2.5,
              boxShadow: '0 4px 12px rgba(229,62,62,0.3)',
              '&:hover': {
                backgroundColor: '#c53030',
                boxShadow: '0 6px 18px rgba(229,62,62,0.4)',
              },
            }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminArticles;
