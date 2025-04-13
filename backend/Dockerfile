# Použij oficiální Node.js image jako základ
FROM node:18

# Nastav pracovní adresář v kontejneru
WORKDIR /app

# Zkopíruj balíčky a nainstaluj závislosti
COPY package*.json ./
RUN npm install

# Zkopíruj zbytek aplikace do kontejneru
COPY . .

# Vytvoř adresář pro databáze
RUN mkdir -p data

# Vystav port (mělo by odpovídat tomu, který používáš v aplikaci)
EXPOSE 3000

# Spusť aplikaci
CMD ["node", "index.js"]
