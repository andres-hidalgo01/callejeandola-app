# Callejeandola — Smoke Test Checklist

## API

- [ ] API starts on port 4000
- [ ] GET /api/spots returns data
- [ ] GET /api/events returns data
- [ ] GET /api/shops returns data
- [ ] GET /api/sponsors returns data
- [ ] POST /api/auth/register creates SKATER
- [ ] POST /api/auth/login returns token
- [ ] GET /api/auth/me works with token
- [ ] GET /api/profile/me works with token
- [ ] Register load test 100 users passes

## Public App

- [ ] App opens on port 5520
- [ ] Spots render
- [ ] Events render
- [ ] Shops render
- [ ] Sponsors render
- [ ] User can register
- [ ] User can login
- [ ] Profile renders
- [ ] Profile can be updated
- [ ] Favorite spot works
- [ ] Saved event works
- [ ] Route Hub opens map panel
- [ ] Waze button opens external route
- [ ] Google Maps button opens external route

## Admin

- [ ] Admin opens on port 5510
- [ ] GLOBAL_ADMIN can login
- [ ] Dashboard renders
- [ ] Spots module renders
- [ ] Events module renders
- [ ] Shops module renders
- [ ] Sponsors module renders
- [ ] Users module renders
- [ ] User role can be changed
- [ ] User can be deactivated/reactivated