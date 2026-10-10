# 前端镜像: Node 构建 + nginx（请用 --platform linux/arm64 在 M 系列 Mac 构建）
FROM node:20-alpine AS build
WORKDIR /src
COPY package*.json ./
RUN npm config set registry https://mirrors.cloud.tencent.com/npm/ && npm ci
COPY . .
RUN npm run build

# 使用官方 nginx alpine，配合 buildx --platform linux/arm64 即可在 Mac 原生运行
FROM nginx:alpine
ENV TZ=Asia/Shanghai \
    NGINX_PORT=80 \
    GATEWAY_UPSTREAM=hbbxl-gateway:8800
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /src/dist /usr/share/nginx/html
EXPOSE 80
