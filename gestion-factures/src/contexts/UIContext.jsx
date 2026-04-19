import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
    autoHideDuration: 3500,
  });

  const notify = useCallback((options) => {
    const message = typeof options === 'string' ? options : options?.message;
    if (!message) return;

    setSnackbar({
      open: true,
      message,
      severity: (typeof options === 'object' && options?.severity) || 'info',
      autoHideDuration: (typeof options === 'object' && options?.autoHideDuration) || 3500,
    });
  }, []);

  const closeSnackbar = useCallback(() => {
    setSnackbar((s) => ({ ...s, open: false }));
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <UIContext.Provider value={value}>
      {children}
      <Snackbar
        open={snackbar.open}
        onClose={closeSnackbar}
        autoHideDuration={snackbar.autoHideDuration}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: '12px' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </UIContext.Provider>
  );
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI doit être utilisé à l’intérieur de UIProvider');
  return ctx;
}

