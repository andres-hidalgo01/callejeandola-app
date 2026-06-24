# Callejeandola — Domain Routing

## Objective

Prepare domain and subdomain routing for the Callejeandola MVP demo.

## Target domains

### Public App

Primary:

https://callejeandola.com

Fallback / alias:

https://www.callejeandola.com

Optional app subdomain:

https://app.callejeandola.com

Purpose:

Public mobile-first Callejeandola app for skaters.

---

### Admin Dashboard

Target:

https://admin.callejeandola.com

Purpose:

Private admin dashboard for managing spots, events, shops, sponsors and users.

Access:

Only authorized admin users.

---

### API

Target:

https://api.callejeandola.com/api

Health check:

https://api.callejeandola.com/api/health

Purpose:

Backend API for public app and admin dashboard.

---

## DNS Plan

### Root domain

callejeandola.com

Points to public app provider.

### www

www.callejeandola.com

Redirects or aliases to callejeandola.com.

### app

app.callejeandola.com

Points to public app provider.

### admin

admin.callejeandola.com

Points to admin static app provider.

### api

api.callejeandola.com

Points to backend API provider.

---

## API CORS allowed origins

Required origins:

https://callejeandola.com
https://www.callejeandola.com
https://app.callejeandola.com
https://admin.callejeandola.com

Local origins:

http://127.0.0.1:5500
http://localhost:5500
http://127.0.0.1:5510
http://localhost:5510
http://127.0.0.1:5520
http://localhost:5520

---

## Deploy order

1. Deploy database.
2. Deploy API.
3. Verify API health check.
4. Deploy public app.
5. Deploy admin dashboard.
6. Configure DNS records.
7. Configure SSL.
8. Validate CORS.
9. Run smoke tests.

---

## Smoke tests after domain routing

### API

GET https://api.callejeandola.com/api/health

Expected:

API returns healthy response.

### Public App

- Open https://callejeandola.com
- Spots load
- Spot detail opens
- Route map opens
- Profile login/register works
- Email verification flow still works

### Admin

- Open https://admin.callejeandola.com
- Login works
- Dashboard loads
- Users module loads
- Spots/events/shops/sponsors load

---

## Notes

Do not expose .env files.

Do not commit real provider secrets.

Keep Cloudinary keys only in provider environment variables.

Use .env.example only as documentation.