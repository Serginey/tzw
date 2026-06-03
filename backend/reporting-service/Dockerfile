FROM node:20-alpine
WORKDIR /app
COPY backend/reporting-service/package*.json ./
RUN npm install --omit=dev
COPY backend/reporting-service ./
EXPOSE 5006
CMD ["node", "server.js"]
