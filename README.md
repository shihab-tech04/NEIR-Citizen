# NEIR Citizen — BTRC presentation prototype

Frontend presentation reconstruction of reference NEIR Citizen Portal screens. **Not an official service.** No government data, real citizen authentication, IMEI lookup, OTP transmission, ticket submission or upload is connected. The two synthetic test logins now use an isolated Supabase demo table and Edge Function; this does **not** create real Supabase Auth sessions or official NEIR access.

## Source
- React + TypeScript + Vite + Tailwind.
- Saved page HTML supplied by the product-design owner is the design and content reference, not the Angular source.
- Implementation coverage and unverified areas: [docs/source-coverage.md](docs/source-coverage.md).
- Original AI Studio starter state: `0823fd2ed0d0b422de20ffd96f5bbb4afad8620a`.
- Branch: `feat/source-faithful-imei-baseline`.
- The future Proposed Design route stays logically separate; its contents are not approved redesign work.

## Run for a local presentation

```sh
npm install
npm run lint
npm run build
npm run dev
```

Open http://localhost:3000/. For an offline meeting, build in advance and test any referenced illustrations on the presentation computer. Use a local server for the `dist` directory rather than opening `index.html` directly.

## Demo walkthrough
1. Home → 14-digit IMEI format validation. A success message never claims a live registry lookup.
2. Three-step SMS IMEI guide and three-step NID guide.
3. User Guides → Web registration and reset steps.
4. Contact Us → Create a DEMO ticket → Check Query Status; only works in the running session.
5. Login → use one of the two provisioned test mobile numbers with its test password → simulated Citizen IMEI list. Wrong numbers or passwords are rejected.
6. Registered IMEIs → search → Details → Actions → Special Registration.
7. Step 1 Device Information → Step 2 Verifications → Step 3 attachments → Submit (demo only).
8. Confirm required validations, file-size/type limits, cancellation and logout.

**Safety:** Do not type actual citizen identifiers or credentials; don't commit uploaded source HTML containing personal data. All handset and support-ticket submissions remain client-side simulations. The isolated test accounts are deliberately non-production and do not grant access to real citizen records.

## Isolated Supabase test login

- Project: `NEIR-demo` (`wjsdylxbvdnraztktbtg`); database table `public.neir_demo_users`, with bcrypt password hashes and RLS restricting direct public reads.
- Public Edge Function `neir-demo-login` uses a server-only service role to call `verify_neir_demo_login`; invalid credentials return HTTP 401 and a generic error. The frontend does not store passwords and no Supabase Auth token is issued.
- Test users: `01613961501` (Test Citizen 1) and `01673961501` (Test Citizen 2), each using the supplied test password. The password is intentionally not repeated in this document.
- Schema source: `supabase/migrations/20261031121947_create_neir_demo_login_accounts.sql`; function source: `supabase/functions/neir-demo-login/index.ts`.
- Existing registration and password-reset forms are still frontend simulations; they do not create users in Supabase. A real citizen-auth system requires a separate design and security review.

## Published frontend-only demonstration

- **URL:** https://neir-citizen-ux-demo.vercel.app
- **Vercel state:** READY; `dpl_2Wn65kDGMNMtx3cfphEV5E6WDRz5`, target production for this standalone **demo** project.
- **Access:** Vercel Authentication disabled, password protection disabled, aliases assigned. The external site could not be fetched by the automated web checker; Vercel reports the deployment READY.
- **GitHub:** PR #1 merged into `main`, merge commit `9fc247b4de1b2d4f9acf5e6246dd747b5deb8d23`.
- **Quality checks:** TypeScript and Vite build PASS on merged `main`; local Chromium smoke tests passed desktop login → IMEI list → Special Registration validation → Contact Us, and mobile navigation/login without page overflow or JS errors.
- **Release source:** compiled presentation files were deployed directly using Vercel's file deployment API because this Vercel connection has no GitHub namespace access (`git_info_fail` / 403 for team-linked Git source).
- **Automation:** GitHub CI and an isolated `presentation-static` build branch work; pushes to GitHub **do not auto-deploy** to Vercel until its GitHub integration is authorized.

### Still unverified against the real NEIR interface

**Do not call the baseline pixel-perfect or 100% reconstructed.** The image assets and mobile guides, specific registration dropdown options, login/modal parity, restricted-IMEI content and full visual comparison need further source-based review. See [docs/source-coverage.md](docs/source-coverage.md).

No real BTRC citizen authentication, official registry, OTP, handset data, or official ticket reporting is connected. Only the restricted synthetic-account login is database-backed. This remains a presentation prototype.
