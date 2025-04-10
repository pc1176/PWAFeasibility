# Stage 1: Build the Angular application
FROM node:22.9.0 AS build

# Set build default argument for configuration
ARG CONFIGURATION=development

# Set working directory
WORKDIR /app

# Skip Downloading electron binaries
ENV ELECTRON_SKIP_BINARY_DOWNLOAD=1

# Copy package.json and package-lock.json
COPY ArcClient/package*.json ./

# Install dependencies
RUN npm install

# Copy the Angular application source code
COPY ArcClient ./

# Build the Angular application
RUN npm run build -- --configuration=${CONFIGURATION}

# Stage 2: Serve the Angular application
FROM nginx:alpine

# Copy built Angular application from the previous stage
COPY --from=build /app/dist/arc-client/browser /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
