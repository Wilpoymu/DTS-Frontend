# Sistema de Modo Demo - DTS Frontend

Este documento explica el sistema completo de modo demo implementado para la aplicación DTS Frontend, incluyendo autenticación bypass y datos de muestra con localStorage.

## ¿Qué es el Modo Demo?

El sistema de modo demo es una solución completa que permite:

### 🚀 Acceso Sin Autenticación
- **Bypass de login**: Acceso directo a todas las funcionalidades
- **Demostraciones a clientes**: Mostrar la funcionalidad completa sin barreras
- **Desarrollo rápido**: Testing sin configuración de usuarios

### 📊 Datos de Muestra Realistas
- **8 Carriers**: Datos completos con diferentes estados y representantes
- **8 Loads**: Cargas variadas con múltiples rutas y tipos de equipo
- **5 Waterfalls**: Configuraciones de waterfall con carriers asignados
- **Persistencia**: Todos los datos se guardan en localStorage

### 🔄 Funcionalidad Completa CRUD
- **Crear/Editar/Eliminar**: Todas las operaciones disponibles
- **Filtros y Búsquedas**: Sistema completo de filtrado
- **Estados y Validaciones**: Comportamiento idéntico al backend real

## Configuración Actual

✅ **MODO DEMO COMPLETAMENTE ACTIVADO**

### Características Implementadas:

#### 🔓 Bypass de Autenticación
- Acceso directo a `/carrier-waterfalls` desde la raíz
- No se requiere login para ninguna página
- Middleware configurado con `DEMO_MODE = true`

#### 📊 Sistema de Datos Demo con localStorage
- **8 Carriers de muestra**: Swift Transportation, J.B. Hunt, FedEx Freight, etc.
- **8 Loads variados**: Múltiples rutas (CA-NY, IL-MI, TX-TX, FL-GA, etc.)
- **5 Waterfalls configurados**: Estados Draft, Active, Paused
- **Persistencia completa**: Todos los cambios se guardan en localStorage

#### 🎯 Indicadores Visuales
- **Badge flotante "DEMO MODE"**: Esquina superior derecha
- **Modal informativo**: Click en badge para ver detalles del sistema
- **Configuraciones demo**: Panel de control para gestionar datos

#### 🔧 Hooks Adaptativos Inteligentes
- `useCarriersAdaptive()`: Alterna automáticamente entre demo/backend
- `useLoadsAdaptive()`: Funcionalidad completa con datos locales
- `useWaterfallsAdaptive()`: Sistema de waterfalls con localStorage

## Estructura del Sistema

### 📁 Archivos Principales

#### Hooks Demo (localStorage)
- `hooks/use-carriers-demo.ts` - CRUD operations para carriers
- `hooks/use-loads-demo.ts` - CRUD operations para loads  
- `hooks/use-waterfalls-demo.ts` - CRUD operations para waterfalls

#### Hooks Adaptativos
- `hooks/use-carriers-adaptive.ts` - Alterna entre demo/backend para carriers
- `hooks/use-loads-adaptive.ts` - Alterna entre demo/backend para loads
- `hooks/use-waterfalls-adaptive.ts` - Alterna entre demo/backend para waterfalls

#### Configuración y Datos
- `hooks/use-demo-config.tsx` - Context provider y configuración demo
- `lib/demo-data-initializer.ts` - Datos de muestra y inicialización
- `components/demo-mode-indicator.tsx` - Indicador visual y configuración

#### Core System
- `middleware.ts` - Control de acceso y bypass de autenticación
- `app/layout.tsx` - Integración de providers y indicadores

### 🔄 Flujo de Datos

```
Component
    ↓
Adaptive Hook (use-carriers-adaptive.ts)
    ↓
Demo Mode Check (use-demo-config.tsx)
    ↓
    ┌─── Backend Hook (API calls)
    └─── Demo Hook (localStorage) ← Demo Data Initializer
```

## Datos de Muestra Incluidos

### 🚛 Carriers (8 carriers completos)
- **Swift Transportation** - Active, Rep: Sarah Johnson
- **J.B. Hunt Transport** - Active, Rep: Mike Rodriguez  
- **FedEx Freight** - Active, Rep: Emma Davis
- **Cold Chain Logistics** - Active, Rep: Robert Miller
- **Schneider Trucking** - Inactive, Rep: Jennifer Wilson
- **Express Delivery Solutions** - Active, Rep: David Thompson
- **Regional Freight Partners** - Active, Rep: Lisa Anderson
- **National Logistics Corp** - Active, Rep: Kevin Martinez

### � Loads (8 loads variados)
- **CA → NY**: Electronics, Dry Van, Booked Covered
- **IL → MI**: Automotive Parts, Flatbed, Booked not Covered
- **TX → TX**: Food Products, Reefer, Available
- **FL → GA**: Machinery, Flatbed, Booked Covered
- **WA → OR**: Chemicals, Reefer, Available
- **PA → MD**: General Freight, Dry Van, Booked not Covered
- **CO → UT**: Electronics, Dry Van, Available
- **AZ → NM**: Construction Materials, Flatbed, Booked Covered

### 🌊 Waterfalls (5 configuraciones)
- **LA-Dallas Dry Van** - Active, 3 carriers asignados
- **Chicago-Detroit Reefer** - Draft, 2 carriers asignados
- **Miami-Atlanta Flatbed** - Active, 4 carriers asignados
- **Phoenix-Denver Any** - Paused, 2 carriers asignados
- **Seattle-Portland Reefer** - Active, 3 carriers asignados

## Funcionalidades por Entidad

### 🚛 Carriers (Directorio de Transportistas)
- ✅ **Crear carrier**: Formulario completo con validaciones
- ✅ **Editar carrier**: Modificar información existente
- ✅ **Eliminar carrier**: Borrado con confirmación
- ✅ **Toggle status**: Activar/Desactivar carriers
- ✅ **Filtros avanzados**: Por nombre, status, rep asignado
- ✅ **Búsqueda**: Búsqueda en tiempo real
- ✅ **Persistencia**: Cambios guardados en localStorage

### 📦 Loads (Gestión de Cargas)
- ✅ **Crear load**: Nuevo load con detalles completos
- ✅ **Editar load**: Modificar cargas existentes
- ✅ **Eliminar load**: Borrado de cargas
- ✅ **Cambiar status**: Available ↔ Booked Covered ↔ Booked not Covered
- ✅ **Filtros múltiples**: Status, origen, destino, fechas, equipo
- ✅ **Obtener por ID**: Detalles específicos de load
- ✅ **Aceptar/Rechazar**: Workflow completo de loads

### 🌊 Waterfalls (Cascadas de Carriers)
- ✅ **Crear waterfall**: Nueva configuración con carriers
- ✅ **Editar waterfall**: Modificar configuraciones existentes
- ✅ **Eliminar waterfall**: Borrado con validaciones
- ✅ **Toggle status**: Draft ↔ Active ↔ Paused
- ✅ **Gestión de carriers**: Asignar/desasignar carriers del waterfall
- ✅ **Filtros completos**: Status, origen, destino, tipo de equipo
- ✅ **Obtener por ID**: Detalles específicos de waterfall
- ✅ **Ordenamiento**: Reordenar carriers en el waterfall

## Uso del Sistema Demo

### 🔄 Activación/Desactivación

#### Para ACTIVAR el modo demo:
1. Abrir `middleware.ts`
2. Cambiar `const DEMO_MODE = true`
3. Opcional: Configurar `NEXT_PUBLIC_DEMO_MODE=true`
4. Reiniciar la aplicación

#### Para DESACTIVAR (volver a producción):
1. Abrir `middleware.ts`
2. Cambiar `const DEMO_MODE = false`
3. Reiniciar la aplicación

### 💻 Migración de Componentes

#### Antes (hooks normales):
```tsx
import { useCarriers } from '@/hooks/use-carriers';
import { useLoads } from '@/hooks/use-loads';
import { useWaterfalls } from '@/hooks/use-waterfalls-backend';

function MyComponent() {
  const { carriers } = useCarriers();
  const { loads } = useLoads();
  const { waterfalls } = useWaterfalls();
}
```

#### Después (hooks adaptativos):
```tsx
import { useCarriersAdaptive } from '@/hooks/use-carriers-adaptive';
import { useLoadsAdaptive } from '@/hooks/use-loads-adaptive';
import { useWaterfallsAdaptive } from '@/hooks/use-waterfalls-adaptive';

function MyComponent() {
  // Estos hooks automáticamente usan demo o backend según configuración
  const { carriers } = useCarriersAdaptive();
  const { loads } = useLoadsAdaptive();
  const { waterfalls } = useWaterfallsAdaptive();
}
```

### 🔍 Verificar Estado Demo

```tsx
import { useIsDemoMode } from '@/hooks/use-demo-config';

function MyComponent() {
  const isDemoMode = useIsDemoMode();
  
  return (
    <div>
      {isDemoMode ? (
        <p>Funcionando con datos demo</p>
      ) : (
        <p>Conectado al backend real</p>
      )}
    </div>
  );
}
```

## 🗄️ localStorage Keys

Los datos se almacenan en localStorage con estas claves:

- `demo-carriers` - Lista completa de carriers
- `demo-loads` - Lista completa de loads
- `demo-waterfalls` - Lista completa de waterfalls
- `demo-data-initialized` - Flag de inicialización automática

## 🚨 Troubleshooting

### ❌ No se ven datos de muestra
**Soluciones:**
1. Verificar que `autoInitializeDemoData()` se ejecuta en inicialización
2. Abrir DevTools → Application → Local Storage → Verificar claves `demo-*`
3. Limpiar localStorage y recargar la página
4. Revisar consola para errores de inicialización

### ❌ Hook no usa modo demo
**Soluciones:**
1. Verificar que se está usando el hook adaptativo (`use-*-adaptive`)
2. Confirmar que `DEMO_MODE = true` en `middleware.ts`
3. Verificar configuración en `use-demo-config.tsx`
4. Revisar que `useIsDemoMode()` retorna `true`

### ❌ Datos no persisten entre recargas
**Soluciones:**
1. Verificar que localStorage está habilitado en el navegador
2. Confirmar que las funciones `save*ToLocalStorage` se ejecutan correctamente
3. Revisar errores en consola relacionados con localStorage
4. Verificar que el dominio no está en modo incógnito/privado

### ❌ Errores de TypeScript
**Soluciones:**
1. Verificar que las interfaces están correctamente importadas
2. Confirmar que las funciones de transformación de datos funcionan
3. Revisar que los tipos de backend coinciden con los tipos demo

## 🛠️ Development y Extensión

### Agregar Nuevos Datos de Muestra

Para agregar más datos demo, editar `lib/demo-data-initializer.ts`:

```typescript
// Agregar más carriers
export const SAMPLE_CARRIERS = [
  // ... carriers existentes
  {
    id: "9",
    company_name: "Nuevo Carrier Demo",
    primary_contact: "Juan Pérez",
    phone: "555-0199",
    email: "juan@nuevodemo.com",
    address: "123 Demo St",
    city: "Demo City",
    state: "DC",
    zip: "12345",
    status: "active",
    assigned_rep: "Demo Rep",
    dot_number: "999999",
    mc_number: "MC999999"
  }
];
```

### Crear Hook Demo para Nueva Entidad

1. **Crear hook demo**: `hooks/use-nueva-entidad-demo.ts`
```typescript
import { useState, useEffect } from 'react';

export function useNuevaEntidadDemo() {
  const [entities, setEntities] = useState([]);
  
  const loadFromLocalStorage = () => {
    const stored = localStorage.getItem('demo-nueva-entidad');
    return stored ? JSON.parse(stored) : [];
  };
  
  const saveToLocalStorage = (data) => {
    localStorage.setItem('demo-nueva-entidad', JSON.stringify(data));
  };
  
  // Implementar CRUD operations...
  
  return { entities, createEntity, updateEntity, deleteEntity };
}
```

2. **Crear hook adaptativo**: `hooks/use-nueva-entidad-adaptive.ts`
```typescript
import { useIsDemoMode } from './use-demo-config';
import { useNuevaEntidadDemo } from './use-nueva-entidad-demo';
import { useNuevaEntidad } from './use-nueva-entidad'; // Hook backend real

export function useNuevaEntidadAdaptive() {
  const isDemoMode = useIsDemoMode();
  
  if (isDemoMode) {
    return useNuevaEntidadDemo();
  } else {
    return useNuevaEntidad();
  }
}
```

### Testing del Sistema Demo

#### 1. Verificación Visual
- ✅ Badge "DEMO MODE" visible en esquina superior derecha
- ✅ Modal de información al hacer click en badge
- ✅ Datos de muestra cargados en todas las tablas

#### 2. Verificación localStorage
```javascript
// En DevTools Console
console.log('Carriers:', JSON.parse(localStorage.getItem('demo-carriers')));
console.log('Loads:', JSON.parse(localStorage.getItem('demo-loads')));
console.log('Waterfalls:', JSON.parse(localStorage.getItem('demo-waterfalls')));
```

#### 3. Testing de Funcionalidades
- ✅ Crear nuevo carrier/load/waterfall
- ✅ Editar entidades existentes
- ✅ Filtrar y buscar
- ✅ Cambiar estados (Active/Inactive, Draft/Active/Paused)
- ✅ Persistencia entre recargas de página

## 📋 Páginas y Rutas

| Ruta | Descripción | Estado Demo | Funcionalidades |
|------|-------------|-------------|-----------------|
| `/` | Página principal | ➡️ Redirige a `/carrier-waterfalls` | Acceso directo |
| `/carrier-waterfalls` | Gestión de waterfalls | ✅ Completo | CRUD + filtros + estados |
| `/loads` | Gestión de cargas | ✅ Completo | CRUD + workflow + filtros |
| `/carrier-directory` | Directorio de carriers | ✅ Completo | CRUD + búsqueda + estados |
| `/admin-settings` | Configuraciones admin | ✅ Accesible | Configuraciones generales |
| `/brand-style-guide` | Guía de estilos | ✅ Accesible | Documentación de UI |
| `/auth/*` | Páginas de autenticación | ✅ Accesible (opcional) | Login/registro opcionales |

## ⚠️ Notas Importantes

### 🏭 Para Producción
- **CRÍTICO**: Cambiar `DEMO_MODE = false` antes de deploy
- **Seguridad**: Nunca usar modo demo con datos reales de clientes
- **Performance**: Los datos demo no están optimizados para grandes volúmenes

### 🧪 Para Desarrollo
- **Ideal para**: Desarrollo rápido, testing de UI, demostraciones
- **Ventajas**: No requiere backend, datos consistentes, testing offline
- **Limitaciones**: No simula latencia de red, no valida autenticación real

### 🎯 Para Demostraciones
- **Perfecto para**: Mostrar funcionalidades a clientes
- **Datos realistas**: Información de ejemplo representativa
- **Sin barreras**: Acceso inmediato sin configuración

## 🚀 Roadmap y Futuras Mejoras

### 📅 Próximas Funcionalidades
- [ ] **Modo híbrido**: Algunos datos demo, otros del backend real
- [ ] **Importar/Exportar**: Subir y descargar conjuntos de datos demo
- [ ] **Dashboard de configuración**: Panel de control para gestionar datos demo
- [ ] **Simulación de latencia**: Simular delays de red para testing realista
- [ ] **Modo offline automático**: Fallback a demo cuando backend no disponible
- [ ] **Datos dinámicos**: Generar datos aleatorios con patrones realistas
- [ ] **Multi-tenant demo**: Diferentes conjuntos de datos por cliente

### 🔧 Mejoras Técnicas Pendientes
- [ ] **Tests unitarios**: Cobertura completa para hooks demo
- [ ] **Validaciones robustas**: Validación de datos más estricta
- [ ] **Error handling**: Manejo de errores mejorado
- [ ] **Performance**: Optimización para grandes volúmenes de datos
- [ ] **TypeScript**: Tipado más estricto y documentación de interfaces
- [ ] **Logging**: Sistema de logs detallado para debugging
- [ ] **Backup automático**: Respaldo automático de datos modificados

### 📚 Documentación Pendiente
- [ ] **API Reference**: Documentación completa de todas las funciones
- [ ] **Video tutoriales**: Guías paso a paso para uso del sistema
- [ ] **Best practices**: Mejores prácticas para desarrollo con modo demo
- [ ] **Troubleshooting avanzado**: Guía completa de resolución de problemas

---

## 📞 Soporte

### 🐛 Reportar Problemas
Si encuentras algún problema con el sistema demo:
1. Verificar la sección de Troubleshooting
2. Revisar los logs en la consola del navegador
3. Verificar que localStorage esté funcionando correctamente
4. Contactar al equipo de desarrollo con detalles específicos

### 🤝 Contribuir
Para contribuir al sistema demo:
1. Seguir las guías de desarrollo mencionadas arriba
2. Mantener compatibilidad con interfaces existentes
3. Agregar tests para nuevas funcionalidades
4. Actualizar la documentación correspondiente

---

**Última actualización**: Enero 2025  
**Estado actual**: ✅ Modo Demo Completamente Funcional  
**Versión**: 2.0 - Sistema completo con localStorage y hooks adaptativos  
**Mantenedores**: Equipo DTS Frontend Development
