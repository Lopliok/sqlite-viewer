# === Build fáze ===
FROM node:20-alpine AS builder

# Instalujeme závislosti pro kompilaci (Python3, make, g++)
RUN apk add --no-cache python3 make g++

# Nastavíme pracovní adresář
WORKDIR /app

# Zkopírujeme package.json a package-lock.json (nebo yarn.lock)
COPY package*.json ./

# Instalujeme závislosti (bez --production, protože budeme buildit)
RUN npm install

# Zkopírujeme zbytek aplikace
COPY . .

# Buildíme TypeScript → JavaScript
RUN npm run build


# === Production fáze ===
FROM node:20-alpine AS runner

# Nastavíme proměnné
ENV NODE_ENV=production

# Vytvoříme pracovní složku
WORKDIR /app

# Zkopírujeme jen to, co je potřeba pro běh
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Exponujeme port (např. 3000)
EXPOSE 3000

# Start příkaz – záleží na tom, co máš v package.json
CMD ["node", "dist/server.js"]
