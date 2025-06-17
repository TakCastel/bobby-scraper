# Utilise une image Node légère
FROM node:20-slim

# Installe Chromium et ses dépendances pour Puppeteer
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
    xdg-utils \
    libu2f-udev && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Définit le dossier de travail
WORKDIR /app

# Copie les fichiers de configuration et installe les dépendances Node.js
COPY package*.json ./
RUN npm install

# Copie le reste du projet
COPY . .

# Expose le port 8080, utilisé par Railway pour le routing
EXPOSE 8080

# Commande pour démarrer le serveur Express
CMD ["node", "index.js"]
