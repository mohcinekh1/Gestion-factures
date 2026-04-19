// ========== PARTIE 1 : IMPORTS ==========
import { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import { auth, database } from '../services/firebase';
import { Box, CircularProgress } from '@mui/material';
// ========== PARTIE 2 : CRÉATION DU CONTEXTE ==========
const AuthContext = createContext(null);
// ========== PARTIE 3 : HOOK useAuth ==========
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error('useAuth doit être utilisé à l\'intérieur de AuthProvider');
    }
    return context;
  }
  // ========== PARTIE 4 : AUTH PROVIDER ==========
export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
  // ========== PARTIE 5 : LISTENER AUTH + RÉCUPÉRATION DU RÔLE ==========
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const roleRef = ref(database, `users/${user.uid}/role`);
          const snapshot = await get(roleRef);
          setUserRole(snapshot.exists() ? snapshot.val() : 'user');
        } catch (err) {
          setUserRole('user');
        }
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
    // ========== PARTIE 6 : FONCTIONS D'AUTHENTIFICATION ==========
    async function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
      }
    
      async function logout() {
        return signOut(auth);
      }
    
      async function register(email, password, nom) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const { uid } = userCredential.user;

        await set(ref(database, `users/${uid}`), {
          role: 'user',
          nom,
          email,
        });

        return userCredential;
      }
  // ========== PARTIE 7 : VALEUR DU CONTEXTE ==========
  const value = {
    currentUser,
    userRole,
    loading,
    login,
    logout,
    register,
  };
    // ========== PARTIE 8 : RENDU ==========
    if (loading) {
        return (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
            <CircularProgress />
          </Box>
        );
      }
    
      return (
        <AuthContext.Provider value={value}>
          {children}
        </AuthContext.Provider>
      );
    }