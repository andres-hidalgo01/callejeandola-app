# Callejeandola — Deploy Provider Setup

## Services

### Public App
Static frontend.

Local:
http://127.0.0.1:5520

Production target:
https://callejeandola.com
https://app.callejeandola.com

### Admin
Static admin dashboard.

Local:
http://127.0.0.1:5510

Production target:
https://admin.callejeandola.com

### API
Node.js / Express API.

Local:
http://localhost:4000/api

Production target:
https://api.callejeandola.com/api

Health check:
GET /api/health

## Required API environment variables

NODE_ENV
PORT
DATABASE_URL
JWT_SECRET
JWT_EXPIRES_IN
CLIENT_ORIGINS
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
CLOUDINARY_FOLDER

## Deploy order

1. Deploy PostgreSQL database.
2. Configure API environment variables.
3. Deploy API.
4. Test API health check.
5. Run database sync/deploy command.
6. Seed only demo-safe data if needed.
7. Deploy public app.
8. Deploy admin.
9. Configure CORS with final domains.
10. Run smoke tests.

## Smoke tests

API:
- GET /api/health
- GET /api/spots
- GET /api/events
- GET /api/shops
- POST /api/auth/login

Public app:
- Spots load
- Spot detail opens
- Route opens map
- Profile login/register works
- Email verification UI still works

Admin:
- Login works
- Dashboard loads
- Users load
- Spots/events/shops/sponsors load