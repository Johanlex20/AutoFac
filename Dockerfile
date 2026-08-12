# ============================
# Etapa 1: Construcción (build)
# ============================
FROM node:24-alpine AS build

# Directorio de trabajo
WORKDIR /app

# Copiamos los archivos necesarios
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el resto del código
COPY . .

# Compilamos la app Angular para producción
RUN npm run build -- --configuration production

# ============================
# Etapa 2: Servidor NGINX
# ============================
FROM nginx:1.25-alpine

# Copiamos los archivos compilados de Angular al contenedor de NGINX
COPY --from=build /app/dist/auto-fac/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponemos el puerto 80
EXPOSE 80

# NGINX arranca automáticamente
CMD ["nginx", "-g", "daemon off;"]