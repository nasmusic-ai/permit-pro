// src/store/auth.ts (or wherever useAuthStore is defined)
import create from 'zustand';

interface AuthState {
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,

  login: async (email: string, password: string) => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.token) {
        set({ token: data.token });
        localStorage.setItem('token', data.token); // persist JWT
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  logout: () => {
    set({ token: null });
    localStorage.removeItem('token');
  },
}));