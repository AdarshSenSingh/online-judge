# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Create necessary directories if needed
RUN mkdir -p logs

# Expose the service port
EXPOSE 5000

# Start the application
CMD ["node", "index.js"]

