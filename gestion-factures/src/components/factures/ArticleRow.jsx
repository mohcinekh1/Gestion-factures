import {
  TableRow,
  TableCell,
  TextField,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { formatCurrency } from '../../utils/calculations';

const NAVY = '#0A0F2C';
const GOLD = '#F0B429';

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    fontSize: '0.875rem',
    '& fieldset': { borderColor: 'rgba(10,15,44,0.12)' },
    '&:hover fieldset': { borderColor: GOLD },
    '&.Mui-focused fieldset': { borderColor: GOLD, borderWidth: '2px' },
  },
};

function computeTotalLigne(qte, prix_unitaire, remise, methode_calcul) {
  const q = Number(qte) || 0;
  const p = Number(prix_unitaire) || 0;
  if (methode_calcul === 2) {
    const r = Math.min(100, Math.max(0, Number(remise) || 0));
    return q * p * (1 - r / 100);
  }
  return q * p;
}

function ArticleRow({
  index,
  field,
  remove,
  articlesCatalog,
  methode_calcul,
  setFieldValue,
  handleChange,
  handleBlur,
  canRemove,
  error,
}) {
  const baseName = `articles.${index}`;
  const qte = field.qte ?? 1;
  const prix_unitaire = field.prix_unitaire ?? 0;
  const remise = field.remise ?? 0;
  const total_ligne = computeTotalLigne(qte, prix_unitaire, remise, methode_calcul);

  const handleArticleSelect = (articleId) => {
    const article = articlesCatalog.find((a) => a.id === Number(articleId) || a.id === articleId);
    if (article) {
      setFieldValue(`${baseName}.article_id`, article.id);
      setFieldValue(`${baseName}.designation`, article.designation);
      setFieldValue(`${baseName}.prix_unitaire`, article.prix_unitaire);
      setFieldValue(`${baseName}.categorie_id`, article.categorie_id);
      const newTotal = computeTotalLigne(qte, article.prix_unitaire, remise, methode_calcul);
      setFieldValue(`${baseName}.total_ligne`, newTotal);
    }
  };

  const handleQteOrPrixChange = (e) => {
    handleChange(e);
    const { name, value } = e.target;
    const q = name.includes('qte') ? Number(value) || 0 : qte;
    const p = name.includes('prix_unitaire') ? Number(value) || 0 : prix_unitaire;
    const newTotal = computeTotalLigne(q, p, remise, methode_calcul);
    setFieldValue(`${baseName}.total_ligne`, newTotal);
  };

  const handleRemiseChange = (e) => {
    handleChange(e);
    const r = Number(e.target.value) || 0;
    const newTotal = computeTotalLigne(qte, prix_unitaire, r, methode_calcul);
    setFieldValue(`${baseName}.total_ligne`, newTotal);
  };

  const showRemise = methode_calcul === 2;

  return (
    <TableRow
      sx={{
        '& .MuiTableCell-root': {
          borderBottom: '1px solid rgba(10,15,44,0.08)',
          py: 1.5,
          verticalAlign: 'top',
        },
      }}
    >
      <TableCell sx={{ minWidth: 200 }}>
        {articlesCatalog.length > 0 ? (
          <FormControl fullWidth size="small" sx={inputSx}>
            <Select
              name={`${baseName}.article_id`}
              value={field.article_id ?? ''}
              onChange={(e) => handleArticleSelect(e.target.value)}
              displayEmpty
            >
              <MenuItem value="">
                <em style={{ color: '#aaa', fontStyle: 'normal' }}>Sélectionner un article</em>
              </MenuItem>
              {articlesCatalog.map((a) => (
                <MenuItem key={a.id} value={a.id}>
                  {a.designation} — {formatCurrency(a.prix_unitaire)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <TextField
            name={`${baseName}.designation`}
            label="Désignation *"
            value={field.designation ?? ''}
            onChange={handleChange}
            onBlur={handleBlur}
            error={Boolean(error?.designation)}
            helperText={error?.designation}
            placeholder="Saisir la désignation"
            size="small"
            fullWidth
            sx={inputSx}
          />
        )}
        {field.designation && articlesCatalog.length > 0 && (
          <Typography sx={{ fontSize: '0.75rem', color: '#8A94A6', mt: 0.5 }}>
            {field.designation}
          </Typography>
        )}
      </TableCell>

      <TableCell sx={{ width: 90 }}>
        <TextField
          name={`${baseName}.qte`}
          type="number"
          value={qte}
          onChange={handleQteOrPrixChange}
          onBlur={handleBlur}
          inputProps={{ min: 1, step: 1 }}
          size="small"
          fullWidth
          sx={inputSx}
        />
      </TableCell>

      <TableCell sx={{ width: 120 }}>
        <TextField
          name={`${baseName}.prix_unitaire`}
          type="number"
          value={prix_unitaire}
          onChange={handleQteOrPrixChange}
          onBlur={handleBlur}
          inputProps={{ min: 0, step: '0.01' }}
          size="small"
          fullWidth
          sx={inputSx}
        />
      </TableCell>

      {showRemise && (
        <TableCell sx={{ width: 90 }}>
          <TextField
            name={`${baseName}.remise`}
            type="number"
            value={remise}
            onChange={handleRemiseChange}
            onBlur={handleBlur}
            inputProps={{ min: 0, max: 100, step: 0.5 }}
            size="small"
            fullWidth
            sx={inputSx}
            placeholder="0%"
          />
        </TableCell>
      )}

      <TableCell sx={{ minWidth: 110 }}>
        <Box
          sx={{
            py: 1,
            px: 1.5,
            borderRadius: '8px',
            backgroundColor: 'rgba(240,180,41,0.08)',
            fontWeight: 600,
            fontSize: '0.875rem',
            color: NAVY,
          }}
        >
          {formatCurrency(total_ligne)}
        </Box>
      </TableCell>

      <TableCell sx={{ width: 56 }}>
        <IconButton
          size="small"
          onClick={remove}
          disabled={!canRemove}
          title={canRemove ? 'Supprimer la ligne' : 'Au moins 1 ligne requise'}
          sx={{
            color: canRemove ? '#e53e3e' : '#CBD5E0',
            '&:hover': { backgroundColor: canRemove ? 'rgba(229,62,62,0.08)' : 'transparent' },
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}

export default ArticleRow;
