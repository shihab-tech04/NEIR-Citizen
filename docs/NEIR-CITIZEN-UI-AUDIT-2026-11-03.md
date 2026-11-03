# NEIR Citizen — UI system audit and acceptance register
Date: 2026-11-03
Source baseline: `main` 2c426bc8daee3b20a5be3261628e91c5fbc7bc33
Current implementation: PR #81, `refactor/neir-citizen-unified-ui-foundation-20261103`
Reference: approved NEIR Citizen screenshots, original BTRC source capture, current NEIR Admin responsive table.

## Coverage and method
Reviewed the GitHub source tree: 37 TypeScript/TSX/CSS source files under `src/`, including current route composition in `src/App.tsx`, controls in `src/ui/`, all named Citizen view components, and relevant styles. Compared active UI implementations to the Admin `MobileRecordCard` and existing Citizen source-parity/visual/journey checks. CI results, production deployment and browser behavior must be verified independently; code presence alone is not a release PASS. This audit does **not** claim that every external user journey or official BTRC service was reproduced or verified.

| Area | Finding / implementation | Current acceptance |
|---|---|---|
| Profile split | Both cards at 50:50, equal-sized CTAs, desktop; stack on mobile | PASS — deployed 2c426bc8; Playwright and Pages checks |
| Citizen application table | Existing desktop sortable/searchable UiDataTable; mobile card rows same filtered data, row/Details interaction | PASS — deployed 2c426bc8; 320px journey |
| Modal system | Three **active** roots (`NeirModalFrame`, `LoginModal`, `ProfileSpecialRegistrationModal`) had duplicated Escape, Tab focus trap, focus restore and scroll lock | CORRECTED IN PR — centralized `useNeirDialogFocus`; CI required |
| Modal UI | Existing approved dialog shapes, footer, scroll and nested document-sample states must remain | PRESERVED IN SOURCE; visual/journey CI required |
| Action buttons | UiButton exposed four action variants; wizard/Login also used native separate CTA styles | CORRECTED IN PR — canonical **Primary** and **Link**, correct hover states; icon, menu, option and tab controls remain separate semantics |
| Typography | Poppins globally; repeated hard-coded sizes across page/component CSS; EN/BN text expansion risk | IMPROVED — semantic responsive type tokens introduced; **full replacement of every legacy fixed size UNVERIFIED** |
| Forms | Contact and profile already used shared controls; login had eight native inputs and separate buttons | CORRECTED IN PR — active login/register/forgot adopt UiInput and Primary action; validation remains unchanged |
| Dropdowns | Three header language selects had separate native styling; custom Special Registration Dropdown exists separately | CORRECTED IN PR — language dropdowns adopt UiSelect; **custom option popup migration NOT DONE** because behavior/navigation must be preserved |
| Colors | Existing teal/border values repeatedly hard-coded in legacy source and CSS | IMPROVED — shared semantic tokens for modal, actions and main registration status; **global no-literal-color goal NOT YET PASS** |
| Tags/status | Citizen profile and applications used duplicated success/warning/error/info colors | CORRECTED IN PR — shared status semantic tokens |
| FAQ selection | First attempted color-token refactor introduced a width regression in frozen 1918px source-parity check | CORRECTED — flex sizing restored; 1918/390px source CI required |
| User Guides selection | Selected cards previously used 8px borders | CORRECTED IN PR — shared selectable-card pattern, retains assets and route flow |
| Responsive | Previous checks covered desktop and 320px mobile, not tablet and intermediate widths | EXTENDED IN PR — 320, 360, 390, 768, 1024, 1440, 1918px UI checks; CI required |
| EN/BN | Header, profile and quota have language variants; a subset of dialogs are English-only in historical source | PARTIAL — language selection regression covered at 390/1440; comprehensive translation parity UNVERIFIED |
| Accessibility | New active modal focus behavior, keyboard row/card actions and form labels covered | PARTIAL — screen-reader, focus across every legacy route and contrast audit UNVERIFIED |
| API and SQL | Citizen Special Registration / private file sync and 20-active-IMEI quota are existing verified features | UNCHANGED — no migrations or Edge/role changes in this UI PR |
| Legacy UI | `CitizenDashboardModal`, `FigmaSpecialRegistrationModal`, `ImeiChecker`, proposed design route and reference components retain custom controls/styles | OPEN — do not delete or rewrite without verifying call sites and functional ownership |
| Security/backend release | No new security or backend contracts requested | NO BACKEND CHANGE; prior findings and runtime integration require separate evidence |

## Root cause
Different generations of the NEIR prototype independently implement modal focus behavior, buttons, field geometry and color declarations, producing multiple slightly different visual contracts. Repeated presentation rules in `src/index.css`, `NeirSharedModal.css`, and feature CSS can override shared primitives. A safe solution is a centralized API for active flows, semantically tokenized controls, source-parity CI, then **incremental** removal of obsolete duplication after consumer-by-consumer verification. Blind global CSS replacement or deletion would regress previously approved screens.

## Locked contracts
Preserve citizen EN/BN entry, guest explanation → login → login-success → wizard, 14/15 digit IMEI validation, historical application list, 20-active-slot quota (Accepted frees a slot), read/write to current SQL/Edge API and file mirror to Admin; preserve mobile card and desktop table, approved NEIR branding/artwork, routes, login/logout and keyboard access. Do not modify Admin/SQL in a UI-only release.

## Follow-on findings requiring evidence before a global COMPLETE claim
1. Catalogue and resolve all active legacy standalone controls and redundant selectors only after code-reference/reachability tests.
2. Audit typography and color literals by selector and viewport rather than globally overriding or removing them.
3. Prove full EN/BN labels, keyboard/screen-reader and focus recovery for every applicable path.
4. Confirm actual published commit/compiled assets and no introduced API/SQL regression before marking release LIVE.

## Release gates
- PR frontend typecheck/build and `ui:audit`.
- Source-level unified controls contract and seven-breakpoint Playwright.
- FAQ original-source pixel-parity, visual regression tests, and functional guest/citizen registration journeys.
- Verified independently restorable pre-release full Git/source backup with checksums.
- Protected merge, real Pages deployment, `RELEASE_COMMIT.txt` readback, and live compiled assets.
Every missing or failed test stays **UNVERIFIED/FAIL**, never implicitly PASS.
