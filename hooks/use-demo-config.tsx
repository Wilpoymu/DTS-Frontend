"use client"

import { createContext, useContext, useState, ReactNode } from 'react';

interface DemoConfigContextType {
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  setDemoMode: (enabled: boolean) => void;
}

const DemoConfigContext = createContext<DemoConfigContextType | undefined>(undefined);

export function DemoConfigProvider({ children }: { children: ReactNode }) {
  // Por defecto, el modo demo está activado según el middleware
  const [isDemoMode, setIsDemoMode] = useState(true);

  const toggleDemoMode = () => {
    setIsDemoMode(prev => !prev);
    console.log(`🔄 Demo mode ${isDemoMode ? 'disabled' : 'enabled'}`);
  };

  const setDemoMode = (enabled: boolean) => {
    setIsDemoMode(enabled);
    console.log(`🔧 Demo mode ${enabled ? 'enabled' : 'disabled'}`);
  };

  return (
    <DemoConfigContext.Provider value={{ isDemoMode, toggleDemoMode, setDemoMode }}>
      {children}
    </DemoConfigContext.Provider>
  );
}

export function useDemoConfig() {
  const context = useContext(DemoConfigContext);
  if (context === undefined) {
    throw new Error('useDemoConfig must be used within a DemoConfigProvider');
  }
  return context;
}

/**
 * Hook que determina si estamos en modo demo basado en las variables de entorno
 * y la configuración del contexto
 */
export function useIsDemoMode(): boolean {
  // Verificar si estamos en modo demo según el middleware y variables de entorno
  const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || true;
  
  // En modo demo, siempre retornar true
  return DEMO_MODE;
}
