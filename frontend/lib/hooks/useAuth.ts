import { useState, useEffect } from 'react';

// Stub ligero de `useAuth` para desarrollo local.
// Proporciona token y user minimal para que los hooks que lo importan no rompan la compilación.
export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    try {
      const t = localStorage.getItem('token') || sessionStorage.getItem('token');
      setToken(t);
      const uJson = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (uJson) setUser(JSON.parse(uJson));
    } catch (err) {
      // noop
    }
  }, []);

  return {
    token,
    user,
    isLogged: !!token,
    setToken: (t: string | null) => {
      setToken(t);
      if (t) localStorage.setItem('token', t); else localStorage.removeItem('token');
    },
    setUser: (u: any) => {
      setUser(u);
      if (u) localStorage.setItem('user', JSON.stringify(u)); else localStorage.removeItem('user');
    }
  };
}

export default useAuth;
