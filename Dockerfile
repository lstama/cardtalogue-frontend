# --- contract types ---------------------------------------------------------
# The frontend is contract-driven: API types are imported via the '@contract/*'
# alias (tsconfig.json / vite.config.ts), which resolves to
# ../cardtalogue-api-contract/gen/ts relative to /app.
#
# The generated TypeScript is gitignored in the contract repo, so the image
# build generates it from the contract source (contracts/backend.yaml) instead
# of expecting committed output. The contract repo is supplied as a BuildKit
# named build context:
#
#   docker buildx build --build-context contract-src=../cardtalogue-api-contract .
#
# Without that flag the build cannot resolve 'contract-src' — see README.md
# ("Docker image build").
FROM node:20-alpine AS contract-types

# Pinned to cardtalogue-api-contract's devDependency (package-lock.json: 7.13.0)
# so the image's generated types cannot drift from the contract repo's own
# `make generate-ts` output.
ARG OPENAPI_TYPESCRIPT_VERSION=7.13.0

WORKDIR /contract
COPY --from=contract-src contracts/backend.yaml ./contracts/backend.yaml
RUN npx --yes openapi-typescript@${OPENAPI_TYPESCRIPT_VERSION} \
        contracts/backend.yaml -o gen/ts/backend.ts \
    && test -s gen/ts/backend.ts \
    && grep -q 'export interface paths' gen/ts/backend.ts

FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Drop the generated contract types exactly where the existing '@contract/*'
# alias already looks for them, so no tsconfig.json / vite.config.ts change and
# no hand-vendoring is needed.
COPY --from=contract-types /contract/gen/ts /cardtalogue-api-contract/gen/ts

ARG VITE_API_BASE_URL
ARG VITE_CAP_API_ENDPOINT
ARG VITE_CAPTCHA_ENABLED
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_CAP_API_ENDPOINT=$VITE_CAP_API_ENDPOINT \
    VITE_CAPTCHA_ENABLED=$VITE_CAPTCHA_ENABLED

RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html

RUN cat > /etc/nginx/conf.d/default.conf <<'EOF'
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
