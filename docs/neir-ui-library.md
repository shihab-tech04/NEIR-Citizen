# NEIR Citizen — unified UI library and full frontend component audit

**Baseline audited:** production `f744dd70` (1 November 2026).  
**Scope:** `shihab-tech04/NEIR-Citizen` only, including the routed frontend, shared components and retained historical source. This does **not** modify NEIR Admin, backend authorization, Supabase migrations, Nadia, or unrelated projects.

## Component inventory

The repository contains **19 TSX component modules** and **six preexisting CSS stylesheets**, with approximately **92 literal buttons, 31 inputs, four selects, two textareas, three table tags, and ten forms** before consolidation. These counts are source-level, not the count of controls simultaneously displayed.

| Surface | Existing structure | Unified contract |
|---|---|---|
| Home IMEI verification | One form with local status | `UiInput`, `UiButton`, approved hero layout |
| Guest eligibility and post-login confirmation | Two shared modal-frame instances | `UiDialog`, `UiButton`; single focus/scroll handling |
| Login, registration, password recovery | One login dialog with three modes | `UiInput`, `UiButton`; preserve login service and expand control |
| My Profile and device search | Custom field/action styles, four dialogs | Shared input, modal action and `UiDialog` |
| Special Registration | Existing locked IMEI-first single modal, reason cards, documents | `UiInput`, `UiButton`; preserve method-triggered fields and sample swap |
| Special Registration applications | One HTML table and status variants | `UiDataTable`, `UiStatusBadge`; search, sort, row details and keyboard support |
| Contact Us | Two tabs, separate query/ticket forms, independent Tailwind form controls | `UiInput`, `UiSelect`, `UiTextarea`, `UiButton`, uniform choice tabs |
| Header, language, menu, FAQs, user guides | Contextual navigation and disclosure controls | Unified tokens, keyboard focus/disabled behavior; existing navigation geometry retained |
| PDF/document sample | Two illustration-only tables | **Not data grids:** preserve printable document illustration |
| Unrouted historical components | `CitizenDashboardModal`, `FigmaSpecialRegistrationModal`, `ImeiChecker`, `SpecialRegistrationDropdown`, `CitizenServices` | Retained to avoid destroying prior work; global tokens/focus styles apply, but **not** treated as production screens |
| Proposed Design route | Explicit experimental sandbox | Kept isolated; not allowed to overwrite the locked baseline design |

## Single source of truth

`src/ui/index.ts` exports all shared building blocks. `src/ui/neir-ui.css` owns the semantic tokens and common states.

- Typography: **Poppins**, default 16px; help/metadata 14px. Bengali fonts use the established fallback.
- Approved brand colors: **#00ACC1** and **#00838F**, white surfaces and subtle grey strokes. No gradients in unified components.
- Input: 60px desktop / 52px mobile, 12px corners; shared focus, invalid and disabled states.
- Actions: 54px desktop / 48px mobile, one pill radius and standardized primary, secondary, quiet, danger variants.
- Dialog: 16px radius, common header divider, accessible Escape/focus trap, desktop dialog and mobile bottom sheet. Existing specialized wizard retains its approved specific layout.
- Data table: header labels, min-width with horizontal mobile scroll, numeric alignment, status color semantics, optional instant search and column sort; full-row focus/Enter/Space and a distinct Details action.
- Accessibility: semantic native controls, connected labels, disabled gates, keyboard operability, visible focus, and reduced-motion support.

### Usage

```tsx
import { UiButton, UiInput, UiField, UiDialog, UiDataTable, UiStatusBadge } from '../ui/index.ts';

<UiButton variant="primary" type="submit">Submit</UiButton>
<UiButton variant="secondary" fullWidth>Proceed to login</UiButton>

<UiField id="imei" label="IMEI Number" required>
  <UiInput id="imei" inputMode="numeric" value={imei} onChange={onChange} />
</UiField>

<UiStatusBadge tone="warning">Pending</UiStatusBadge>

<UiDialog title="Details" ariaLabel="Device details" onClose={onClose}>
  <p>Content</p>
</UiDialog>
```

`UiDataTable<Row>` receives typed `rows`, `columns`, `rowKey`, optional `searchable` and `onRowClick`. A consumer implements service calls; the UI package itself has **no** network/database logic.

## Adoption and safeguards

The implementation migrates all current **form-heavy active flows** (home verifier, login, contact, My Profile, Special Registration, and registration table) to common controls while leaving existing backend service calls, pending/accepted statuses, IMEI validations, sample document rendering, approved modal animation and responsive layout intact.

`scripts/neir-ui-audit.mjs` is a CI guardrail. Run `npm run ui:audit`, `npm run lint`, `npm run build` and the existing desktop/mobile browser journeys before a production merge. The audit intentionally excludes document illustrations from the application-table count and reports inactive historical modules separately.

**Limits:** This is one **frontend** UI library, not a shared package with the separate NEIR Admin repository. UI unification does not certify backend functionality, production device data accuracy, or the experimental Proposed Design sandbox.
