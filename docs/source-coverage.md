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

## Known gaps / NOT yet 1:1 PASS
1. Public homepage layout, source color tokens and imagery: current AI Studio-generated React version still has non-source government announcement/metrics and green branding. Must be visually compared and corrected.
2. Header: official BTRC logo and government seal asset copies are missing; current design includes extra FAQ/Proposed tabs and a prototype banner absent from captured UI.
3. Contact form: saved reference has Full Name, Mobile, Email, Choose Purpose Type, Issues Summary; current React contains extra fields and Captcha not present in capture.
4. Login: saved reference has Mobile Number, Password and account reset links; current generated form has extra demo affordances. Need source-comparison.
5. Source IMEI checker requests first 14 digits; generated React presently validates 15 digits with captcha. Needs correction or separate scoped review.
6. Missing official options for Application Reason and Purchase Method in saved HTML; temporary free-text demo inputs are flagged in UI.
7. Restricted IMEIs contents, IMEI Details payload, actual submission outcome and backend authorization are not available from the snapshots; do not invent them.
8. Desktop/mobile pixel-diff, offline asset verification, build/TS checks, accessibility and route refresh recovery must PASS before marking entire baseline 1:1.

## Presentation safeguards
- Use synthetic IMEI and account records, with no sensitive data from captured snapshots.
- Mark all simulated results as **DEMO — NOT CONNECTED TO BTRC**.
- Keep proposed redesign isolated; do not present it as approved or part of the official system.
- No SQL, Supabase, credential storage, OTP delivery, IMEI API, server-side submission or real government records.

## Acceptance route
Open the app, use Login (demo), reach authenticated IMEI list, search a fixture IMEI, inspect Details/Actions, open Special Registration, validate Step 1 → Step 2 → Step 3, verify attachments reject >1MB and disallowed MIME types, then return to the list. Verify Home, User Guides, Contact Us, log out and mobile layout independently.
