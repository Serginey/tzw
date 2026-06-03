FROM node:20-alpine
WORKDIR /app
COPY backend/extinguisher-service/package*.json ./
RUN npm install --omit=dev
COPY backend/extinguisher-service ./
EXPOSE 5003
CMD ["node", "server.js"]
