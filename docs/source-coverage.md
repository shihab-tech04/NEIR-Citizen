# BTRC NEIR Citizen — Reference-based baseline coverage (27 October 2026)

## Status and source priority
This is a **frontend-only demonstration**, not the official BTRC NEIR service. The saved HTML snapshots supplied for the presentation are the authority for page labels, fields, actions and sequence. They are browser-rendered snapshots, **not** the underlying Angular source or backend contracts. Keep the existing React code on `main` unchanged until a PR is reviewed and passed.

## Source inventory
| Snapshot | Captured screen | Coverage |
|---|---|---|
| NEIR Citizen(1).html | Public homepage | Existing React home needs visual parity verification |
| NEIR Citizen2(1).html | Public homepage with Login dialog | Existing React login flow needs input/visual parity verification |
| NEIR Citizen 3(1).html | User Guides / Account Registration | Existing React guide; check steps, assets and mobile variant |
| NEIR Citizen 5(1).html | Contact Us / Submit New Query | Existing React contact form differs in field count; needs source parity |
| NEIR Citizen 6.html | Authenticated Registered IMEIs | New source-aligned full-page route, synthetic entries only |
| NEIR Citizen 7.html | IMEI list with Actions menu | Actions, Details, Special Registration and Mark as Stolen demo |
| NEIR Citizen 8.html | Special Registration Step 1 | Device Information fields and BMET branch |
| NEIR Citizen 9.html | Special Registration Step 2 | Verification fields |
| NEIR Citizen 10.html | Step 2 required validation state | Application Reason validation |
| NEIR Citizen 11.html | Step 2 validation state | Same relevant captured state |
| NEIR Citizen 12.html | Special Registration Step 3 | Four document controls and 1MB PNG/JPG/PDF constraints |

Some earlier unnumbered snapshots in the conversation are duplicate homepage/guide/contact captures. Do not publish or commit the raw HTML files: authenticated copies can contain personal information.

## Source-backed demonstrated features
- Registered IMEIs: identity area, Edit Profile Informations, Registered/Restricted tabs, NID notice, 14-digit IMEI columns, search, device statuses, details/actions and 10-row pagination.
- Special Registration: Step 1 Device Information (IMEI Number, Select device, Device Brand Name, Device Model Number, Device Serial Number, BMET question/number), Step 2 Verifications (Application Reason, arrival date, passport number, purchase method, tax amount), Step 3 Attachments & Finalize (Passport info page, Passport arrival date seal, Device box IMEI no, Travel document). Previous / Next / Submit navigation and required errors.
- Browser-local demonstration only: registration isn't transmitted, simulated device marking isn't an official stolen report, profile edits are local, and fixtures are synthetic.
- Default locale on captured pages: English.

## Verification and remaining gaps
**CI:** TypeScript and Vite production build succeeded at commit `1faf9028b6544aef213cce0f60e9509e091e5d4d`; rerun for each later commit before merge. Browser-rendered visual comparison is **not** yet verified.

### Source-backed changes in this branch
- Captured homepage hero, cyan palette, Poppins loading, first-14-digit IMEI field (demo validation only), two 3-step how-to sections, and FAQ structure.
- Header Home / User Guides / Contact Us, distinct Register and Login actions, default English, copyright footer.
- Contact Us Submit New Query and Check Query Status; source-backed form fields and local demo ticket lookup, no government API.
- User Guides: captured 4-step registration and 5-step reset Web instructions; attempts to load source image assets and shows an honest fallback when offline.
- Authenticated full-page IMEI list; searchable 19 synthetic records, 10-row pagination, captured status labels, action menu and details demonstration.
- 3-step Special Registration form and 1MB PNG/JPG/PDF attachment checks. No actual upload/submission.

### Still blocking a complete 1:1 claim
1. Original BTRC/GoB logos, animated hero, guide illustrations and step art are linked from test-server URLs. A self-contained verified asset bundle is needed for offline parity.
2. Pixel-by-pixel desktop and mobile comparison with the user's connected original portal has not been run in a controlled screenshot environment.
3. The native options for Special Registration's Application Reason and How you purchased the device? dropdowns were not present in the saved HTML. The prototype uses explicitly labeled text entry until the actual options are verified.
4. The original Restricted IMEIs tab's contents, full Details payload and actual responses from verification/authentication are not represented in available static snapshots.
5. Mobile guide content and all original EN/BN translations were not fully captured; these remain incomplete rather than being invented.
6. The generated sign-in and registration modal requires further exact field-by-field parity review against the saved login capture.
7. A staged interactive deployment / offline backup is not yet verified. Do not call the website **LIVE** until its actual URL and deployed commit are checked.
8. The original FAQ capture covered the IMEI Check category; content of other tabs is intentionally marked unavailable in the prototype.

## Presentation safeguards
- Use synthetic IMEI and account records, with no sensitive data from captured snapshots.
- Mark all simulated results as **DEMO — NOT CONNECTED TO BTRC**.
- Keep proposed redesign isolated; do not present it as approved or part of the official system.
- No SQL, Supabase, credential storage, OTP delivery, IMEI API, server-side submission or real government records.

## Acceptance route
Open the app, use Login (demo), reach authenticated IMEI list, search a fixture IMEI, inspect Details/Actions, open Special Registration, validate Step 1 → Step 2 → Step 3, verify attachments reject >1MB and disallowed MIME types, then return to the list. Verify Home, User Guides, Contact Us, log out and mobile layout independently.

## 28 October 2026 — 1:1 parity correction checkpoint
The earlier blanket statement that **Application Reason** options were unavailable was incorrect. `NEIR Citizen 10.html` exposes three selectable choices. The Step 2 dropdown now reproduces those choices. The purchase-method dropdown is again a select, but its original options remain unavailable and **the single explicit demo fallback is not source-certified**.

Corrections in `fix/neir-parity-20261028`:
- Full password-reset overview now requests the existing original `.png` asset, never an absent `.webp`.
- User Guides / Mobile shows the captured Web instructions as a clearly identified fallback instead of empty steps; the original native Mobile guide is still not captured.
- Recovered full FAQ responses for the two previously abbreviated items; three other FAQ tabs still lack verified original content.
- Registration demo validates four document digits, password and matching confirmation; no live OTP.
- App paths and browser history preserve /user-guides and /contact-us on refresh/back; Vercel fallback rewrites added.
- Mobile IMEI field has a visible small-screen label and the prototype disclaimer no longer overlays content.
- PR/main visual smoke checks exercise guide assets and subpage reload.

Still unverified: Contact Us purpose options, purchase method option values, missing FAQ tabs, original native mobile guide, full EN/BN source translations and controlled source-vs-live pixel diff. Frontend-only demonstration boundaries remain unchanged. Do not certify 100% parity without these reference-backed acceptance checks.
