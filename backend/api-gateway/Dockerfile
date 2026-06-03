FROM node:20-alpine
WORKDIR /app
COPY backend/api-gateway/package*.json ./
RUN npm install --omit=dev
COPY backend/api-gateway ./
EXPOSE 5000
CMD ["node", "server.js"]
