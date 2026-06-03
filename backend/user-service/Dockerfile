FROM node:20-alpine
WORKDIR /app
COPY backend/user-service/package*.json ./
RUN npm install --omit=dev
COPY backend/user-service ./
EXPOSE 5002
CMD ["node", "server.js"]
