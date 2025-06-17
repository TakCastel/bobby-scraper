# Image Node légère avec Debian
FROM node:20-slim

# Installe Chromium + toutes ses dépendances nécessaires
RUN apt-get update && \
    apt-get install -y \
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
    xdg-utils \
    libu2f-udev && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Dossier de travail
WORKDIR /app

# Copie le package et installe les dépendances Node.js
COPY package*.json ./
RUN npm install

# Copie le reste du projet
COPY . .

# Port Railway
EXPOSE 8080

# Commande pour démarrer ton scraper
CMD ["node", "index.js"]
