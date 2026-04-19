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
        // #region agent log
        fetch('http://127.0.0.1:7917/ingest/6da683cf-3b2e-4b89-bb75-50469f877af6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0be1d4'},body:JSON.stringify({sessionId:'0be1d4',location:'AuthContext.jsx:56',message:'register() called',data:{email,nom},hypothesisId:'H-A',timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        let userCredential;
        try {
          userCredential = await createUserWithEmailAndPassword(auth, email, password);
          // #region agent log
          fetch('http://127.0.0.1:7917/ingest/6da683cf-3b2e-4b89-bb75-50469f877af6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0be1d4'},body:JSON.stringify({sessionId:'0be1d4',location:'AuthContext.jsx:61',message:'Auth createUser SUCCESS',data:{uid:userCredential.user.uid},hypothesisId:'H-A',timestamp:Date.now()})}).catch(()=>{});
          // #endregion
        } catch(authErr) {
          // #region agent log
          fetch('http://127.0.0.1:7917/ingest/6da683cf-3b2e-4b89-bb75-50469f877af6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0be1d4'},body:JSON.stringify({sessionId:'0be1d4',location:'AuthContext.jsx:65',message:'Auth createUser FAILED',data:{code:authErr.code,message:authErr.message},hypothesisId:'H-A',timestamp:Date.now()})}).catch(()=>{});
          // #endregion
          throw authErr;
        }
        const { uid } = userCredential.user;
        try {
          await set(ref(database, `users/${uid}`), {
            role: 'user',
            nom,
            email,
          });
          // #region agent log
          fetch('http://127.0.0.1:7917/ingest/6da683cf-3b2e-4b89-bb75-50469f877af6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0be1d4'},body:JSON.stringify({sessionId:'0be1d4',location:'AuthContext.jsx:75',message:'RTDB set users SUCCESS',data:{uid},hypothesisId:'H-B-H-C',timestamp:Date.now()})}).catch(()=>{});
          // #endregion
        } catch(dbErr) {
          // #region agent log
          fetch('http://127.0.0.1:7917/ingest/6da683cf-3b2e-4b89-bb75-50469f877af6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0be1d4'},body:JSON.stringify({sessionId:'0be1d4',location:'AuthContext.jsx:79',message:'RTDB set users FAILED - continuing anyway',data:{code:dbErr.code,message:dbErr.message},hypothesisId:'H-B-H-C',timestamp:Date.now()})}).catch(()=>{});
          // #endregion
          console.warn('Profil RTDB non créé (règles Firebase) :', dbErr.message);
        }
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