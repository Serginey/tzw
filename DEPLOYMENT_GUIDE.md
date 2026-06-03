# Deployment Guide

1. Change `JWT_SECRET`, database credentials, and SMTP app password before production.
2. Use HTTPS so the `__Host-fems_token` cookie can be marked secure.
3. Run `docker compose up --build -d`.
4. Visit `http://localhost:3000`.
5. Visit Swagger at `http://localhost:5000/api/docs`.

For production, place the API gateway behind a reverse proxy, use a managed PostgreSQL database with TLS, and restrict `ALLOWED_ORIGINS` to the deployed frontend domain.
