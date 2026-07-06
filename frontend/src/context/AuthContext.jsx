import { createContext, useCallback, useMemo, useState } from 'react';
import { login as loginRequest } from '../api/authApi';

export const AuthContext = createContext(null);

function readStoredAdmin() {
  try {
    const raw = localStorage.getItem('mora_admin_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('mora_admin_token'));
  const [admin, setAdmin] = useState(readStoredAdmin);

  const login = useCallback(async (email, password, rememberMe) => {
    const result = await loginRequest(email, password, rememberMe);
    localStorage.setItem('mora_admin_token', result.token);
    localStorage.setItem('mora_admin_user', JSON.stringify(result.admin));
    setToken(result.token);
    setAdmin(result.admin);
    return result.admin;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('mora_admin_token');
    localStorage.removeItem('mora_admin_user');
    setToken(null);
    setAdmin(null);
  }, []);

  const value = useMemo(
    () => ({ token, admin, isAuthenticated: Boolean(token), login, logout }),
    [token, admin, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
