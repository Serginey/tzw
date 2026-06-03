FROM node:20-alpine
WORKDIR /app
COPY backend/inspection-service/package*.json ./
RUN npm install --omit=dev
COPY backend/inspection-service ./
EXPOSE 5004
CMD ["node", "server.js"]
