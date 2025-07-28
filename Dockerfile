# Usar Node.js 20 Alpine para mejor seguridad y menor tamaño
FROM node:20-alpine AS base

# Instalar dependencias del sistema necesarias para pnpm y algunas librerías nativas
RUN apk add --no-cache libc6-compat

# Instalar pnpm 10.12.4 globalmente
RUN npm install -g pnpm@10.12.4

WORKDIR /app

# Copiar archivos de configuración de pnpm
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Etapa de construcción
FROM base AS builder

WORKDIR /app

# Copiar todo el código fuente
COPY . .

# Configurar variables de entorno para la construcción
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Construir la aplicación
RUN pnpm run build

# Etapa de producción
FROM node:20-alpine AS runner

WORKDIR /app

# Instalar pnpm en la imagen de producción
RUN npm install -g pnpm@10.12.4

# Crear usuario no-root para mayor seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos públicos
COPY --from=builder /app/public ./public

# Copiar archivos de construcción con permisos correctos
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Configurar variables de entorno
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Exponer el puerto
EXPOSE 3000

# Cambiar al usuario no-root
USER nextjs

# Comando de inicio
CMD ["node", "server.js"]
