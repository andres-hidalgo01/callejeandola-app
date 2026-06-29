# Callejeandola — Demo Readiness Audit

## Objective

Validate the first official Callejeandola MVP demo before public deployment.

This audit does not introduce new features. It only verifies that the current product is stable enough to show.

## Current MVP scope

### Included

- Public mobile-first app
- Admin dashboard
- API
- PostgreSQL readiness
- Auth
- Roles
- User management
- Spots
- Events
- Shops
- Sponsors
- Profile
- Favorites
- Saved events
- Email verification code flow
- Cloudinary image upload
- Internal map route experience
- Onboarding wizard
- Deploy/domain preparation docs

### Not included for this demo

- Internal turn-by-turn navigation
- Waze clone behavior
- Payment gateway
- Full monetization
- Competition registration
- Premium/Gold visual system
- Full i18n coverage
- Email provider integration
- Full production observability

## Public App Smoke Test

Local URL:

http://127.0.0.1:5520/index.html

### Spots

- [ ] Spots view loads
- [ ] Search works
- [ ] Filters work
- [ ] Spot card image displays
- [ ] Spot detail opens
- [ ] Favorite button works
- [ ] Route button opens map
- [ ] Map displays selected spot
- [ ] Route active card displays

### Events

- [ ] Events view loads
- [ ] Event cards display
- [ ] Event detail opens
- [ ] Save event works

### Shops

- [ ] Shops view loads
- [ ] Shop cards display
- [ ] Shop detail opens if available

### Profile

- [ ] Guest profile state displays
- [ ] Register works
- [ ] Login works
- [ ] Logout works
- [ ] Email verification panel displays when needed
- [ ] Resend verification code works
- [ ] Profile update works

### Onboarding

- [ ] Onboarding opens only when not completed
- [ ] Next works
- [ ] Back works
- [ ] Skip works
- [ ] Help button opens onboarding again

## Admin Smoke Test

Local URL:

http://127.0.0.1:5510/index.html

### Auth

- [ ] Global admin login works
- [ ] Logout works
- [ ] Invalid login fails
- [ ] Non-admin roles cannot access restricted admin modules

### Modules

- [ ] Dashboard loads
- [ ] Users module loads
- [ ] Users role change works
- [ ] Users deactivate/reactivate works
- [ ] Spots table loads
- [ ] Events table loads
- [ ] Shops table loads
- [ ] Sponsors table loads

## API Smoke Test

Local API:

http://localhost:4000/api

### Public endpoints

- [ ] GET /api/health
- [ ] GET /api/spots
- [ ] GET /api/events
- [ ] GET /api/shops
- [ ] POST /api/auth/login
- [ ] POST /api/auth/register

### Protected endpoints

- [ ] GET /api/auth/me with token
- [ ] GET /api/users with GLOBAL_ADMIN token
- [ ] POST /api/uploads/image with token

## Demo Data

### Users

Keep only demo-safe users:

- [ ] admin@callejeandola.com
- [ ] localadmin@callejeandola.com
- [ ] judge@callejeandola.com
- [ ] skater@callejeandola.com

Remove or deactivate:

- [ ] loadtest_* users
- [ ] duplicated verification test users

### Spots

- [ ] Belén Urban Spot has valid image
- [ ] Belén Urban Spot has valid lat/lng
- [ ] At least 5 Costa Rica spots exist
- [ ] At least 1 spot has Cloudinary image

### Events

- [ ] At least 3 demo events exist
- [ ] Event dates look credible
- [ ] Event detail does not break

### Shops

- [ ] At least 3 demo shops exist
- [ ] At least 1 shop has image
- [ ] Shop data looks credible

### Sponsors

- [ ] Sponsor marquee does not break
- [ ] Sponsor names are demo-safe

## Security Checklist

- [ ] .env is not tracked
- [ ] .env.example has placeholders only
- [ ] Cloudinary API secret is not committed
- [ ] JWT secret is not committed
- [ ] Admin requires login
- [ ] SKATER cannot access Users module
- [ ] JUDGE has limited access
- [ ] LOCAL_ADMIN has limited access
- [ ] GLOBAL_ADMIN can manage users

## Visual Checklist

Mobile width:

320px

- [ ] Header looks acceptable
- [ ] Bottom nav looks acceptable
- [ ] Spots layout does not overflow
- [ ] Events layout does not overflow
- [ ] Shops layout does not overflow
- [ ] Profile layout does not overflow
- [ ] Map layout does not overflow
- [ ] Onboarding layout does not overflow

## Deployment Readiness

- [ ] API has start script
- [ ] API has health endpoint
- [ ] App config supports local and production API
- [ ] Admin config supports local and production API
- [ ] CLIENT_ORIGINS includes production domains
- [ ] Domain routing plan exists
- [ ] Deploy provider setup doc exists

## Final Decision

Demo status:

- [ ] Ready
- [ ] Needs fixes

Blocking issues:

- None yet.