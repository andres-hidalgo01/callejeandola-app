# Callejeandola — Deploy Targets

## Purpose

Operational deployment notes for the MVP demo. This file does not include secrets.

## Services

### Public App
Local: http://127.0.0.1:5520  
Production target: TBD

### Admin
Local: http://127.0.0.1:5510  
Production target: TBD

### API
Local: http://localhost:4000/api  
Health: http://localhost:4000/api/health  
Production target: TBD

### Database
Local: PostgreSQL  
Production target: Managed PostgreSQL

## Required API environment variables

NODE_ENV  
PORT  
DATABASE_URL  
JWT_SECRET  
JWT_EXPIRES_IN  
CLIENT_ORIGINS  

## Deploy order

1. Create managed PostgreSQL database.
2. Configure API environment variables.
3. Deploy API.
4. Run Prisma database sync.
5. Run seed only if the database is demo/empty.
6. Test /api/health.
7. Deploy public app.
8. Deploy admin.
9. Update CLIENT_ORIGINS with final URLs.
10. Run smoke test.

## Two-activity deployment strategy

The codebase should remain the same.

### Activity A — Stable demo
- Stable app
- Stable admin
- Stable API
- Stable database
- No experimental features

### Activity B — Staging / extended activity
- Same codebase
- Optional second frontend URL
- Optional second API/database if needed
- Extra event data
- Experimental modules can be tested here first