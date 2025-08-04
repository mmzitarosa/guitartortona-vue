# ============================================================================
# Stage 1: Build
# ============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copia package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copia il codice sorgente
COPY . .

# Build arguments per variabili d'ambiente
ARG VITE_API_URL
ARG VITE_ENVIRONMENT
ARG VERSION

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_ENVIRONMENT=$VITE_ENVIRONMENT
ENV VITE_VERSION=$VERSION

# Build dell'applicazione
RUN npm run build

# ============================================================================
# Stage 2: Production
# ============================================================================
FROM nginx:1.25-alpine

# Copia build artifacts
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia configurazione nginx custom
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Crea directory per nginx con permessi corretti
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid && \
    mkdir -p /tmp/nginx && \
    chown -R nginx:nginx /tmp/nginx

# Health check aggiornato per porta 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

USER nginx

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]