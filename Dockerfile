# 构建阶段
FROM node:18.15-alpine AS builder

# 设置工作目录
WORKDIR /app

# 设置 npm 使用阿里云镜像
RUN npm config set registry https://registry.npmmirror.com

# 全局安装 pnpm
RUN npm install -g pnpm

# 复制 package.json 和 pnpm-lock.yaml
# COPY package.json pnpm-lock.yaml ./

# 复制源代码
COPY . ./

# 安装依赖
RUN pnpm install

# 构建项目
RUN pnpm build:docker


# 生产环境阶段
FROM nginx:1.23.3-alpine AS final

# 删除默认的 nginx 配置
RUN rm /etc/nginx/conf.d/default.conf

# 复制自定义的 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 复制构建产物到 Nginx 目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 暴露 80 端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]