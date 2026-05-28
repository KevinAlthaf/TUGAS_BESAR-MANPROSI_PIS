import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // User state mock: { role: 'HRD' | 'Operator', companyInfo: null | object }
  const [user, setUser] = useState(null);

  const login = (role) => {
    setUser({ role, companyInfo: null });
  };

  const logout = () => {
    setUser(null);
  };

  const updateCompanyInfo = (info) => {
    if (user && user.role === 'HRD') {
      setUser({ ...user, companyInfo: info });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateCompanyInfo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
