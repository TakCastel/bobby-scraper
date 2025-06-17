FROM node:20-slim

# Installe toutes les dépendances nécessaires pour Chromium
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgbm1 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libxkbcommon0 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libxss1 \
    libxtst6 \
    xdg-utils \
    libu2f-udev \
    libnss3 \
    libgtk-3-0 \
    --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Dossier de travail
WORKDIR /app

# Copie et installe les dépendances Node.js
COPY package*.json ./
RUN npm install

# Copie le reste
COPY . .

# Port Railway
EXPOSE 8080

# Commande de démarrage
CMD ["node", "index.js"]
