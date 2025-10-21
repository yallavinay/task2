# Use a small Node base image
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Install dependencies first (better caching)
COPY package.json ./
RUN npm ci --only=production

# Copy rest of the project
COPY . .

# Expose app port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
