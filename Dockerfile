# =============================================================================
# JSUPTER AI Gateway - Multi-LLM Task-Based Router
# =============================================================================
FROM node:22-alpine

LABEL maintainer="Mulky Malikul Dhaher <mulkymalikuldhaher@email.com>"
LABEL description="JSUPTER AI Gateway - Multi-LLM Task-Based Router with auto-routing and streaming"
LABEL org.opencontainers.image.source="https://github.com/mulkymalikuldhrs/jsputer-proxy"
LABEL org.opencontainers.image.licenses="MIT"

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install --omit=dev && npm cache clean --force

# Copy source code
COPY src/ ./src/
COPY .env.example ./.env.example

# Expose gateway port
EXPOSE 3333

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3333/health || exit 1

# Non-root user for security
RUN addgroup -g 1001 -S gateway && adduser -S gateway -u 1001 -G gateway
USER gateway

# Start the gateway
CMD ["node", "src/index.js"]
