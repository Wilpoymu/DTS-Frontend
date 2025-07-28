# DTS Carrier Waterfall - Docker Setup

Este proyecto está configurado para ejecutarse en contenedores Docker usando Node.js 20 y pnpm 10.12.4.

## Requisitos Previos

- Docker Engine 20.10+
- Docker Compose v2+

## Comandos Docker Disponibles

### Construcción y Ejecución para Producción

```bash
# Construir la imagen de producción
pnpm run docker:build

# Ejecutar contenedor de producción
pnpm run docker:run

# O usar Docker Compose para producción
pnpm run docker:prod
```

### Desarrollo con Docker

```bash
# Ejecutar en modo desarrollo con hot-reload
pnpm run docker:dev
```

### Comandos Docker Manuales

```bash
# Construir imagen de producción
docker build -t fe-dts-carrier-waterfall .

# Ejecutar contenedor de producción
docker run -p 3000:3000 fe-dts-carrier-waterfall

# Construir imagen de desarrollo
docker build -f Dockerfile.dev -t fe-dts-carrier-waterfall:dev .

# Ejecutar contenedor de desarrollo
docker run -p 3000:3000 -v $(pwd):/app -v /app/node_modules fe-dts-carrier-waterfall:dev
```

### Docker Compose

```bash
# Ejecutar en producción
docker-compose up fe-dts-carrier-waterfall

# Ejecutar en desarrollo
docker-compose --profile dev up fe-dts-carrier-waterfall-dev

# Ejecutar en segundo plano
docker-compose up -d fe-dts-carrier-waterfall

# Detener servicios
docker-compose down
```

## Configuración

### Variables de Entorno

El contenedor soporta las siguientes variables de entorno:

- `NODE_ENV`: Entorno de ejecución (development/production)
- `PORT`: Puerto en el que correr la aplicación (default: 3000)
- `HOSTNAME`: Hostname para el servidor (default: 0.0.0.0)

### Volúmenes

Para desarrollo, se montan los siguientes volúmenes:

- `.:/app` - Código fuente para hot-reload
- `/app/node_modules` - Node modules del contenedor
- `/app/.next` - Archivos de build de Next.js

## Optimizaciones de Seguridad

- Uso de imágenes Alpine (menor superficie de ataque)
- Usuario no-root en producción
- Multi-stage builds para reducir tamaño de imagen final
- Dependencias congeladas con pnpm lockfile

## Troubleshooting

### Limpiar Docker

```bash
# Limpiar containers e imágenes no utilizadas
pnpm run docker:clean

# Limpiar todo (cuidado en producción)
docker system prune -a
```

### Reconstruir sin caché

```bash
docker build --no-cache -t fe-dts-carrier-waterfall .
```

### Ver logs del contenedor

```bash
docker-compose logs -f fe-dts-carrier-waterfall
```

## Health Check

El servicio incluye un health check que verifica que la aplicación responda en el puerto 3000. Se ejecuta cada 30 segundos después de un período inicial de 40 segundos.

## Puertos

- **Producción**: `3000:3000`
- **Desarrollo**: `3001:3000`

La aplicación estará disponible en:
- Producción: http://localhost:3000
- Desarrollo: http://localhost:3001
