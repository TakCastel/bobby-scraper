# Use official Node.js base image
FROM node:20-slim

# Install Chromium dependencies
RUN apt-get update && \
    apt-get install -y wget ca-certificates fonts-liberation libasound2 libatk1.0-0 \
    libatk-bridge2.0-0 libcups2 libdbus-1-3 libgbm1 libnspr4 libnss3 \
    libx11-xcb1 libxcomposite1 libxdamage1 libxrandr2 xdg-utils libu2f-udev && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including Puppeteer)
RUN npm install

# Copy app files
COPY . .

# Expose port (Railway uses PORT env)
EXPOSE 8080

# Start server
CMD ["node", "index.js"]
