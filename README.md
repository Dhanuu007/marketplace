# Market Palce

Production-ready two-sided website marketplace, built in phases.

## Current phase

Phase 2 implements authentication only:

- Registration for `BUYER` and `CREATOR`
- Login with password verification
- Logout for stateless JWT sessions
- Password hashing
- JWT issuing and verification
- Authentication middleware
- Role-based authorization middleware
- Protected backend routes
- Protected frontend routes

This phase does not include marketplace listings, products, payments, creator dashboard, admin dashboard, website uploads, or website builder functionality.

## Structure

```text
src/
  app/
  config/
  features/
    auth/
    foundation/
  services/
server/
  config/
  db/
  middleware/
  modules/
    auth/
    health/
  utils/
```

## Scripts

```bash
npm run dev
npm run dev:client
npm run dev:server
npm run server
npm run build
npm run lint
npm run preview
```

## Environment variables

Copy `.env.example` to `.env` for local API configuration.

- `PORT`: Express API port
- `CLIENT_ORIGIN`: allowed frontend origin for CORS
- `VITE_API_BASE_URL`: frontend API base URL
- `MONGODB_URI`: MongoDB connection string
- `MONGODB_DB_NAME`: MongoDB database name
- `MONGODB_SERVER_SELECTION_TIMEOUT_MS`: MongoDB connection timeout
- `JWT_SECRET`: secret used to sign and verify JWTs
- `JWT_EXPIRES_IN`: JWT lifetime
