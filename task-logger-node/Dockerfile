# Etapa 1: Compilar código TypeScript
FROM node:20-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos necesarios para instalación
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar todo el código fuente
COPY . .

# Compilar TypeScript
RUN npm run build

# Etapa 2: Imagen liviana para producción
FROM node:20-alpine

WORKDIR /app

# Copiar solo lo necesario desde la etapa de compilación
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Copiar el archivo de entorno (opcional si usarás -–env-file)
# COPY .env .env

# Exponer puerto (se usa como metadata, no obligatorio)
# EXPOSE 3000

# Comando de inicio
CMD ["node", "dist/src/main"]
