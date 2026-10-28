# NEIR Citizen frontend-only acceptance — 28 October 2026

## Scope frozen
This is a **public presentation mock**, not the official BTRC service. No real identity verification, OTP transmission, account provisioning, IMEI backend, SMS, official ticket submission, or government data access is intended. Use synthetic fixtures only. Presentation navigation, source-backed screen composition, error/empty states, button behavior and responsive layout are in scope.

## Source priority and measured comparison
1. Latest user-provided original HTML/screenshots, including homepage, Login, Guides, Contact Us, authenticated IMEI list, and Special Registration steps.
2. Original publicly accessible NEIR screens captured with read-only browser automation at 1918×924 and 390×844.
3. Existing React components, asset bundle and previously accepted frontend decisions.

The earlier homepage source-to-clone comparison measured the 1918px desktop header, hero, form, IMEI field, CTA, and guide heading at **0px box difference**, with hero text under 1px. The 390px mobile three-card row was measured at under 1px card-position difference. These measurements are **not** a pixel-perfect certificate for every state.

## Coverage by frontend experience
| Screen/state | Source-content status | Frontend demonstration | Visual acceptance |
|---|---|---|---|
| Homepage hero, images, 2× three-step guide | Original screenshot and assets | Rendered, demo IMEI validation only | Measured desktop/mobile geometry; CI image/overflow PASS |
| Login dialog | Supplied login snapshot and public reference | Demo-only modal, no real credentials | Aligned source outlined pill CTA and two-column links; screenshot captured |
| Register/OTP/password-reset modal steps | Registration and Guides references | Visual flow, synthetic OTP | Journey PASS; pixel parity of each modal state not yet source-certified |
| User Guides Web registration (4 steps) & reset (5 steps) | Source text/assets | Source-backed illustrated guide | Interaction and asset decoding PASS, screenshot captured |
| User Guides Mobile registration (5 steps) | Original public source content and six PNG assets | Source-backed, locally bundled images | Interaction and asset check targeted; pixel parity still to review |
| Contact Us/Query status | Supplied form snapshot | Browser-local demo ticket | Submit/lookup/navigation PASS; original purpose dropdown choices unavailable |
| Registered/Restricted IMEIs + Actions/Details | Supplied authenticated snapshots | 19 synthetic records, search, pagination, details, restriction demo | Journeys PASS; full data/profile pixel comparison not certified |
| Special Registration steps 1–3 | Supplied step snapshots | Demo validation, navigation and file checks, no upload | Journey PASS; original purchase dropdown values not captured |
| FAQ IMEI Check | Supplied source text | Full captured content | Visual component tested |
| FAQ Registration and Account & Help | Public source groups, 14 question/answer pairs recovered verbatim | Source questions and answers; accordion states | Browser test added; source text preserved without reinterpretation |
| FAQ About NEIR | Public source groups, six exact answers | Source answers and accordion interactions | Test added; exact-head CI required |
| EN/BN | Source capture primarily English | Partial Bengali UI | Full locale fidelity not source-certified |

## Browser acceptance
`scripts/neir-mock-journeys.mjs` captures desktop and mobile screens and checks:
- Home assets, card counts and horizontal overflow
- FAQ categories and source answers
- Guides registration/reset, real asset decoding, tabs, route refresh
- Contact Us: demo submit, ticket lookup and route changes
- Login invalid/valid demo, dashboard entry, logout
- IMEI: search, pagination, details, action menus, restricted tab
- Special Registration 1→2→3, required validations, >1MB file rejection, valid mock attachment completion
- Profile edit, registration modal and mobile language/login

**No real backend transactions are performed**. The screenshot archive is a review aid, not itself proof of visual identity. Latest exact-head CI and production public URL smoke must be PASS before release.

## Blocking a truthful 100% claim
- Not all original authenticated and modal states have comparable screenshot pairs.
- Original values for Contact Us purpose and Special Registration purchase dropdowns are not fully captured.
- All source FAQ answers have been captured from the current public BTRC frontend. They are presented verbatim, including any inconsistencies in the original wording.
- Full EN/BN translations and responsive parity at intermediate widths remain unverified.
- The existing Vercel team scope `shajib-6798` returns a 403; GitHub Pages is the verified accessible public deployment channel.

A successful GitHub Pages release means **frontend mock live**, not **100% source-parity certified**.
