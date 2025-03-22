# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install required system dependencies
RUN apk update && apk add --no-cache \
    g++ \
    python3 \
    openjdk11 \
    redis

# Create symbolic link for python
RUN ln -sf /usr/bin/python3 /usr/bin/python

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p codes inputs outputs

# Expose the service port
EXPOSE 8000

# Create startup script - fixed version
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'redis-server --daemonize yes' >> /app/start.sh && \
    echo 'sleep 1' >> /app/start.sh && \
    echo 'node index.js' >> /app/start.sh && \
    chmod +x /app/start.sh

# Start the application
CMD ["/app/start.sh"]


