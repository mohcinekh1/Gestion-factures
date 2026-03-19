import { useState } from 'react';
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
  TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CategoryIcon from '@mui/icons-material/Category';
import BlockIcon from '@mui/icons-material/Block';
import { useArticles } from '../../hooks/useArticles';

const NAVY = '#0A0F2C';
const GOLD = '#FB923C';
const TEXT_DARK = '#1A1F36';

const TVA_BY_CATEGORY = {
  Informatique: { label: '20%', color: '#2b6cb0', bg: 'rgba(43,108,176,0.1)' },
  Services:     { label: '10%', color: '#276749', bg: 'rgba(39,103,73,0.1)'  },
  Formation:    { label: '0%',  color: '#744210', bg: 'rgba(116,66,16,0.1)'  },
};

const fieldSx = {
  mb: 0,
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

const categorySchema = (categories, editingId) =>
  Yup.object({
    nom: Yup.string()
      .required('Le nom est requis')
      .min(2, 'Le nom doit contenir au moins 2 caractères')
      .test('unique', 'Ce nom de catégorie existe déjà', (val) => {
        if (!val) return true;
        const others = categories.filter((c) => c.id !== editingId);
        return !others.some((c) => c.nom?.toLowerCase() === val?.toLowerCase());
      }),
  });

function CategoryForm({ open, onClose, category, categories, onSubmit }) {
  const isEdit = Boolean(category);

  const formik = useFormik({
    initialValues: { nom: category?.nom ?? '' },
    validationSchema: categorySchema(categories, category?.id),
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await onSubmit(values);
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
      maxWidth="xs"
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
            background: `radial-gradient(circle, rgba(251,146,60,0.12) 0%, transparent 70%)`,
            pointerEvents: 'none',
          }} />
          <Box sx={{
            width: 38, height: 38, borderRadius: '9px',
            background: `linear-gradient(135deg, ${GOLD} 0%, #FDBA74 100%)`,
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
              {isEdit ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', mt: 0.2 }}>
              {isEdit ? 'Modifiez le nom de la catégorie' : 'Saisissez le nom de la catégorie'}
            </Typography>
          </Box>
        </Box>

        <DialogContent sx={{ px: 3, py: 3, backgroundColor: '#F8F9FC' }}>
          <TextField
            fullWidth
            name="nom"
            label="Nom de la catégorie *"
            value={formik.values.nom}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.nom && Boolean(formik.errors.nom)}
            helperText={formik.touched.nom && formik.errors.nom}
            autoFocus
            sx={fieldSx}
          />
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
              : isEdit ? 'Enregistrer' : 'Ajouter'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

function AdminCategories() {
  const { articles, categories, loading, error, addCategory, updateCategory, deleteCategory } = useArticles();
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [blockedDialogOpen, setBlockedDialogOpen] = useState(false);
  const [blockedCategory, setBlockedCategory] = useState(null);

  const getArticleCount = (categoryId) =>
    articles.filter((a) => a.categorie_id === categoryId).length;

  const handleOpenAdd = () => { setEditingCategory(null); setFormOpen(true); };
  const handleOpenEdit = (cat) => { setEditingCategory(cat); setFormOpen(true); };
  const handleCloseForm = () => { setFormOpen(false); setEditingCategory(null); };

  const handleFormSubmit = async (values) => {
    if (editingCategory) {
      await updateCategory(editingCategory.id, values);
    } else {
      await addCategory(values);
    }
  };

  const handleOpenDelete = (cat) => {
    const count = getArticleCount(cat.id);
    if (count > 0) {
      setBlockedCategory({ ...cat, count });
      setBlockedDialogOpen(true);
    } else {
      setCategoryToDelete(cat);
      setDeleteDialogOpen(true);
    }
  };

  const handleCloseDelete = () => { setDeleteDialogOpen(false); setCategoryToDelete(null); };
  const handleCloseBlocked = () => { setBlockedDialogOpen(false); setBlockedCategory(null); };

  const handleConfirmDelete = async () => {
    if (categoryToDelete) {
      await deleteCategory(categoryToDelete.id);
      handleCloseDelete();
    }
  };

  if (loading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={88} sx={{ mb: 3, borderRadius: '16px' }} />
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
          background: `radial-gradient(circle, rgba(251,146,60,0.12) 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            width: 48, height: 48, borderRadius: '12px',
            background: `linear-gradient(135deg, ${GOLD} 0%, #FDBA74 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <CategoryIcon sx={{ color: NAVY, fontSize: 24 }} />
          </Box>
          <Box>
            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.4rem', lineHeight: 1.2 }}>
              Catégories
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem', mt: 0.3 }}>
              {categories.length} catégorie{categories.length !== 1 ? 's' : ''} — {articles.length} article{articles.length !== 1 ? 's' : ''} au total
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
            boxShadow: `0 4px 16px rgba(251,146,60,0.35)`,
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: '#FDBA74',
              boxShadow: `0 6px 24px rgba(251,146,60,0.5)`,
              transform: 'translateY(-1px)',
            },
          }}
        >
          Nouvelle catégorie
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>
          {error}
        </Alert>
      )}

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
              <TableCell>Catégorie</TableCell>
              <TableCell align="center">Articles</TableCell>
              <TableCell>TVA</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                  <CategoryIcon sx={{ fontSize: 40, color: 'rgba(10,15,44,0.12)', mb: 1, display: 'block', mx: 'auto' }} />
                  <Typography sx={{ color: '#8A94A6', fontSize: '0.875rem' }}>
                    Aucune catégorie. Cliquez sur "Nouvelle catégorie" pour commencer.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              categories.map((cat, index) => {
                const count = getArticleCount(cat.id);
                const tva = TVA_BY_CATEGORY[cat.nom];
                const hasArticles = count > 0;

                return (
                  <TableRow
                    key={cat.id}
                    sx={{
                      backgroundColor: index % 2 === 0 ? '#fff' : 'rgba(10,15,44,0.018)',
                      transition: 'background-color 0.15s ease',
                      '&:hover': { backgroundColor: `rgba(251,146,60,0.06)` },
                      '& .MuiTableCell-root': {
                        borderBottom: '1px solid rgba(10,15,44,0.06)',
                        py: 1.8,
                        fontSize: '0.875rem',
                        color: '#1A1F36',
                      },
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                          width: 34, height: 34, borderRadius: '8px',
                          background: `linear-gradient(135deg, ${NAVY} 0%, #1a2750 100%)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                          border: `2px solid rgba(251,146,60,0.3)`,
                        }}>
                          <CategoryIcon sx={{ fontSize: 16, color: GOLD }} />
                        </Box>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: NAVY }}>
                          {cat.nom}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell align="center">
                      <Chip
                        label={`${count} article${count !== 1 ? 's' : ''}`}
                        size="small"
                        sx={{
                          backgroundColor: hasArticles
                            ? `rgba(251,146,60,0.12)`
                            : 'rgba(10,15,44,0.05)',
                          color: hasArticles ? '#7c2d12' : '#8A94A6',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          height: 24,
                          borderRadius: '6px',
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      {tva ? (
                        <Chip
                          label={`TVA ${tva.label}`}
                          size="small"
                          sx={{
                            backgroundColor: tva.bg,
                            color: tva.color,
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            height: 24,
                            borderRadius: '6px',
                          }}
                        />
                      ) : (
                        <Typography sx={{ color: '#8A94A6', fontSize: '0.82rem' }}>—</Typography>
                      )}
                    </TableCell>

                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEdit(cat)}
                          title="Modifier"
                          sx={{
                            color: NAVY,
                            backgroundColor: 'rgba(10,15,44,0.05)',
                            borderRadius: '8px',
                            width: 32, height: 32,
                            '&:hover': {
                              backgroundColor: `rgba(251,146,60,0.15)`,
                              color: GOLD,
                            },
                          }}
                        >
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDelete(cat)}
                          title={hasArticles ? 'Suppression impossible (articles liés)' : 'Supprimer'}
                          sx={{
                            color: hasArticles ? '#CBD5E0' : '#e53e3e',
                            backgroundColor: hasArticles
                              ? 'rgba(203,213,224,0.15)'
                              : 'rgba(229,62,62,0.06)',
                            borderRadius: '8px',
                            width: 32, height: 32,
                            '&:hover': {
                              backgroundColor: hasArticles
                                ? 'rgba(229,62,62,0.1)'
                                : 'rgba(229,62,62,0.15)',
                              color: hasArticles ? '#fc8181' : '#c53030',
                            },
                          }}
                        >
                          {hasArticles
                            ? <BlockIcon sx={{ fontSize: 16 }} />
                            : <DeleteIcon sx={{ fontSize: 16 }} />
                          }
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

      <CategoryForm
        open={formOpen}
        onClose={handleCloseForm}
        category={editingCategory}
        categories={categories}
        onSubmit={handleFormSubmit}
      />

      {/* Dialog suppression confirmée */}
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
            Supprimer la catégorie
          </DialogTitle>
        </Box>

        <DialogContent sx={{ px: 3, py: 2.5 }}>
          <DialogContentText sx={{ color: '#4A5568', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Êtes-vous sûr de vouloir supprimer la catégorie{' '}
            <Box component="span" sx={{ fontWeight: 700, color: NAVY }}>
              « {categoryToDelete?.nom} »
            </Box>
            {' '}? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={handleCloseDelete}
            sx={{
              color: '#8A94A6', fontWeight: 600, borderRadius: '8px',
              border: '1px solid rgba(10,15,44,0.12)', px: 2.5,
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

      {/* Dialog suppression bloquée */}
      <Dialog
        open={blockedDialogOpen}
        onClose={handleCloseBlocked}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 24px 60px rgba(10,15,44,0.2)',
            maxWidth: 440,
            width: '100%',
            overflow: 'hidden',
          },
        }}
      >
        <Box sx={{
          background: `linear-gradient(135deg, #7B341E 0%, #9C4221 100%)`,
          px: 3, py: 2.5,
          display: 'flex', alignItems: 'center', gap: 1.5,
        }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: '8px',
            backgroundColor: 'rgba(252,129,129,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BlockIcon sx={{ color: '#fc8181', fontSize: 18 }} />
          </Box>
          <DialogTitle sx={{ p: 0, color: '#fff', fontWeight: 700, fontSize: '1.05rem' }}>
            Suppression impossible
          </DialogTitle>
        </Box>

        <DialogContent sx={{ px: 3, py: 2.5 }}>
          <DialogContentText sx={{ color: '#4A5568', fontSize: '0.9rem', lineHeight: 1.7 }}>
            La catégorie{' '}
            <Box component="span" sx={{ fontWeight: 700, color: NAVY }}>
              « {blockedCategory?.nom} »
            </Box>
            {' '}ne peut pas être supprimée car elle contient{' '}
            <Box component="span" sx={{ fontWeight: 700, color: '#e53e3e' }}>
              {blockedCategory?.count} article{blockedCategory?.count !== 1 ? 's' : ''}
            </Box>
            {' '}associé{blockedCategory?.count !== 1 ? 's' : ''}.
            <br /><br />
            Veuillez d'abord supprimer ou réassigner ces articles avant de supprimer cette catégorie.
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={handleCloseBlocked}
            variant="contained"
            sx={{
              backgroundColor: NAVY,
              color: GOLD,
              fontWeight: 700,
              borderRadius: '8px',
              px: 3,
              '&:hover': { backgroundColor: '#141c3f' },
            }}
          >
            Compris
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminCategories;
