- [ ] Add dashboard admin gating using env var `NEXT_PUBLIC_DASHBOARD_ADMIN_EMAIL`
  - [ ] Decode `auth_token` JWT payload and compare email claim
  - [ ] Protect these routes with 404 on unauthorized:
    - [ ] /dashboard
    - [ ] /dashboard/add-product
    - [ ] /dashboard/edit-product/[id]
  - [ ] Ensure TypeScript builds

