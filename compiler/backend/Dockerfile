# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install required system dependencies
RUN apk update && apk add --no-cache \
    g++ \
    python3 \
    openjdk11

# Create symbolic link for python
RUN ln -sf /usr/bin/python3 /usr/bin/python

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p codes inputs outputs

# Set environment variable for Docker
ENV DOCKER_ENV=true

# Expose the service port
EXPOSE 8000

# Start the application
CMD ["node", "index.js"]





