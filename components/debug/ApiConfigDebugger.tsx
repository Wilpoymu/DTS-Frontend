import { useEffect } from 'react';
import { httpClient } from '@/services';

// Componente temporal para debugging de configuración
export function ApiConfigDebugger() {
  useEffect(() => {
    console.log('🔧 [DEBUG] === CONFIGURACIÓN DE API ===');
    console.log('🔧 [DEBUG] NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
    console.log('🔧 [DEBUG] Base URL del cliente:', httpClient.getBaseURL());
    console.log('🔧 [DEBUG] NODE_ENV:', process.env.NODE_ENV);
    console.log('🔧 [DEBUG] ===========================');
    
    // Test de conectividad (opcional)
    const testConnection = async () => {
      try {
        console.log('🔧 [DEBUG] Probando conectividad...');
        // Aquí podrías hacer un request de prueba si tienes un endpoint de health check
        // await httpClient.get('/health');
      } catch (error) {
        console.log('🔧 [DEBUG] Error de conectividad:', error);
      }
    };
    
    testConnection();
  }, []);

  // Solo renderizar en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 10,
      right: 10,
      background: '#000',
      color: '#0f0',
      padding: '10px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999,
      borderRadius: '4px',
      maxWidth: '300px'
    }}>
      <div><strong>🔧 API Config Debug</strong></div>
      <div>URL: {process.env.NEXT_PUBLIC_API_BASE_URL || 'NO DEFINIDA'}</div>
      <div>Client: {httpClient.getBaseURL()}</div>
      <div>ENV: {process.env.NODE_ENV}</div>
    </div>
  );
}

export default ApiConfigDebugger;
