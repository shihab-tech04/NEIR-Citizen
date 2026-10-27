# NEIR Citizen — BTRC presentation prototype

Frontend-only reconstruction of reference NEIR Citizen Portal screens. **Not an official service.** No government data, real authentication, IMEI lookup, OTP transmission, database, ticket submission or upload is connected.

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
5. Login → enter demonstration-only credentials → Citizen IMEI list.
6. Registered IMEIs → search → Details → Actions → Special Registration.
7. Step 1 Device Information → Step 2 Verifications → Step 3 attachments → Submit (demo only).
8. Confirm required validations, file-size/type limits, cancellation and logout.

**Safety:** Do not type actual citizen identifiers or credentials; don't commit uploaded source HTML containing personal data. Every simulated submission is client-side only.

## Release policy
Draft PR only until CI is green, source screenshot comparison is conducted, missing assets/option sets are addressed or accurately disclosed, and an independent presentation preview is verified. Do not merge unverified changes into `main` or call the application `LIVE`.
