import React, { createContext, useContext, useState } from 'react';

type AuthData = {
  email: string;
  password: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
};

type AuthContextType = {
  auth: AuthData;
  setAuth: React.Dispatch<React.SetStateAction<AuthData>>;
  resetAuth: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({ children }: { children: React.ReactNode }){
  const [auth, setAuth] = useState<AuthData>({
    email: '',
    password: '',
    phoneNumber: '',
    firstName: '',
    lastName: '',
  });

  const resetAuth = () => {
    setAuth({
      email: '',
      password: '',
      phoneNumber: '',
      firstName: '',
      lastName: '',
    });
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, resetAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

// 🔸 Hook for easier access
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};


