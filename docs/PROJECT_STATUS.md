# Callejeandola — Project Status

## Current checkpoint

v0.12-postgresql-readiness

## Goal

Callejeandola is a mobile-first skateboarding app for discovering skate spots, saving favorites, following events and opening routes with Waze or Google Maps.

## Architecture

- callejeandola-app: public mobile-first app
- callejeandola-admin: admin dashboard
- callejeandola-api: Node.js / Express API
- PostgreSQL: development database
- Prisma: ORM
- JWT: authentication
- RBAC: role-based access

## Current features

### Public App

- Browse spots
- Browse events
- Browse shops
- Sponsors bar
- Register as SKATER
- Login/logout
- User profile
- Favorite spots
- Saved events
- Route Hub
- Waze / Google Maps external navigation

### Admin

- Login/logout
- Dashboard
- Manage spots
- Manage events
- Manage shops
- Manage sponsors
- Manage users
- Change user roles
- Activate/deactivate users

### API

- Auth register/login/me
- Profile endpoints
- Spots endpoints
- Events endpoints
- Shops endpoints
- Sponsors endpoints
- Users endpoints
- Engagement endpoints
- PostgreSQL support
- Seed data
- Register load test script

## Roles

- GLOBAL_ADMIN
- LOCAL_ADMIN
- JUDGE
- SKATER
- GUEST

## Current load test result

Local PostgreSQL test:

- 100 users / concurrency 10 / 0 failed
- 200 users / concurrency 20 / 0 failed
- 600 users / concurrency 30 / 0 failed

## Known limitations

- No production deploy yet
- No email verification yet
- No Cloudinary upload yet
- No real map engine yet
- No payment gateway yet
- No onboarding wizard yet
- UI needs future GOAT redesign/refactor