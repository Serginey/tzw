FROM node:20-alpine
WORKDIR /app
COPY backend/notification-service/package*.json ./
RUN npm install --omit=dev
COPY backend/notification-service ./
EXPOSE 5007
CMD ["node", "server.js"]
