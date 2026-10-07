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
ENV TZ=Asia/Shanghai NGINX_PORT=80
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /src/dist /usr/share/nginx/html
EXPOSE 80
