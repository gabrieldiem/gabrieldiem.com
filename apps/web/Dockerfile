################################
# Stage 1: Build the React app
################################
FROM node:26-alpine AS builder

WORKDIR /app

# Copy only dependency manifests first (to leverage Docker build cache for faster builds)
COPY package.json package-lock.json /app/
RUN npm ci --no-audit --no-fund

# Type-check and build to /app/dist
COPY . .
RUN npm run build

################################
# Stage 2: Serve with nginx
################################
# Mainline on slim Alpine: ~6 MB against 26 MB, and without curl or brotli, which the old base
# needed CVE upgrades for. It keeps what nginx.conf uses: gzip, headers, and busybox wget.
FROM nginx:mainline-alpine-slim AS runner

# One worker: nginx starts one per CPU by default, and a static page needs one (~3 MB each).
RUN sed -i 's/^worker_processes .*/worker_processes 1;/' /etc/nginx/nginx.conf \
    && grep -q '^worker_processes 1;' /etc/nginx/nginx.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Serving the page, not just answering: the built index.html with the React root in it.
HEALTHCHECK --interval=10s --timeout=5s --retries=5 --start-period=5s \
    CMD wget -qO- http://127.0.0.1/ | grep -q 'id="root"' || exit 1
