'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Auth } from '@/lib/api/auth';
import Loading from '@/components/Loading';
interface User {
  id: number;
  name: string;
  email: string;
  image: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const profile = await Auth.getProfile();
        setUser(profile.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, setIsLoading, isLoading, isLoggedIn: !!user?.id }}>
      {isLoading ? (
        <Loading />
      ) : (
        children
      )}
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