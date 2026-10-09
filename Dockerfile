# 前端镜像: Node 构建产物交给 nginx 托管
# nginx.conf 里用模板使监听端口可通过 NGINX_PORT 环境变量调整
FROM node:20-alpine AS build
WORKDIR /src
COPY package*.json ./
# 腾讯云内网npm镜像: 服务器下载依赖免公网带宽
RUN npm config set registry https://mirrors.cloud.tencent.com/npm/ && npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
# GATEWAY_UPSTREAM: Linux host 网络用 127.0.0.1:8800；Mac compose 用 hbbxl-gateway:8800
ENV TZ=Asia/Shanghai NGINX_PORT=80 GATEWAY_UPSTREAM=127.0.0.1:8800
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /src/dist /usr/share/nginx/html
EXPOSE 80
