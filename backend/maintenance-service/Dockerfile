FROM node:20-alpine
WORKDIR /app
COPY backend/maintenance-service/package*.json ./
RUN npm install --omit=dev
COPY backend/maintenance-service ./
EXPOSE 5005
CMD ["node", "server.js"]
