FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

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
