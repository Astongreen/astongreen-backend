# syntax=docker/dockerfile:1

# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
# Install build tools for native dependencies (bcrypt, mysql2)
RUN apk add --no-cache python3 make g++ \
    && npm ci --omit=dev \
    && apk del python3 make g++

# Stage 2: Build the application
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN apk add --no-cache python3 make g++ \
    && npm ci \
    && apk del python3 make g++
COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN npm run build

# Stage 3: Production image
FROM node:20-alpine AS production
WORKDIR /app

# Set environment variables (can be overridden by docker-compose.yml)
ENV NODE_ENV=production
ENV PORT=8092

# Copy dependencies and built application
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY --from=build /app/dist ./dist

# Create uploads directory (mounted as volume in docker-compose.yml)
RUN mkdir -p /app/uploads

# Expose the port (matches docker-compose.yml PORT=3000)
EXPOSE 8092

# Start the application
CMD ["node", "dist/main.js"]
