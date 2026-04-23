import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Check admin status
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setIsAdmin(userDoc.data().role === 'admin');
        } else {
          // Default admin check for the owner email
          const isDefaultAdmin = firebaseUser.email === "tlsghqls12@gmail.com";
          if (isDefaultAdmin) {
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              email: firebaseUser.email,
              role: 'admin'
            });
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/popup-blocked') {
        alert('팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해주세요.');
      } else if (error.code === 'auth/unauthorized-domain') {
        alert('이 도메인은 Firebase에서 허용되지 않았습니다. 관리자에게 문의하거나 Firebase Console에서 [승인된 도메인]에 현재 주소를 추가해야 합니다.');
      } else {
        alert('로그인 중 오류가 발생했습니다: ' + error.message);
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
