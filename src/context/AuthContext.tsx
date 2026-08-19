import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppUser, UserRole } from '../types';
import { db } from '../services/db';

interface AuthContextType {
  currentUser: AppUser | null;
  login: (email: string, pass: string) => boolean;
  loginAsDemo: (role: UserRole, id?: string) => void;
  logout: () => void;
  register: (userData: any) => AppUser;
  refreshUser: () => void;
  updateProfile: (updates: { senha?: string; email?: string; foto?: string }) => AppUser;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_STORAGE_KEY = 'clinica_escola_current_user_id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);

  useEffect(() => {
    const unsubscribe = db.subscribe(() => {
      if (currentUser) {
        const updated = db.getUserById(currentUser.id);
        if (updated) {
          setCurrentUser(updated);
        }
      }
    });
    return () => unsubscribe();
  }, [currentUser]);

  const login = (email: string, pass: string): boolean => {
    const user = db.findUserByLogin(email);
    if (user && user.senha === pass) {
      setCurrentUser(user);
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, user.id);
      return true;
    }
    return false;
  };

  const loginAsDemo = (role: UserRole, id?: string) => {
    let user: AppUser | undefined;
    if (id) {
      user = db.getUserById(id);
    } else {
      if (role === 'admin') user = db.getAdmins()[0];
      else if (role === 'profissional') user = db.getProfissionais()[0];
      else if (role === 'estagiario') user = db.getEstagiarios()[0];
      else if (role === 'paciente') user = db.getPacientes()[0];
      else if (role === 'orientador') user = db.getOrientadores()[0];
    }

    if (user) {
      setCurrentUser(user);
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, user.id);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  };

  const register = (userData: any): AppUser => {
    const created = db.registerUser(userData);
    // A tela de cadastro não dá acesso direto ao sistema (usuário deve fazer login após cadastro)
    return created;
  };

  const refreshUser = () => {
    if (currentUser) {
      const updated = db.getUserById(currentUser.id);
      if (updated) setCurrentUser(updated);
    }
  };

  const updateProfile = (updates: { senha?: string; email?: string; foto?: string }): AppUser => {
    if (!currentUser) {
      throw new Error('Nenhum usuário logado.');
    }
    const updated = db.updateUserProfile(currentUser.id, updates);
    setCurrentUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        loginAsDemo,
        logout,
        register,
        refreshUser,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
