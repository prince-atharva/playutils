'use client'

import { AuthProvider } from "@/context/AuthContext";

export default function UtilsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}