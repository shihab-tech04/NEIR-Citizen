# NEIR Citizen — UX service/navigation rollback checkpoint (2026-11-04)

## Exact untouched production baseline
- Source: `shihab-tech04/NEIR-Citizen`, pre-release `main` SHA `b56c8dc02ed4753aff1bac56fd73004c661f4a1a`.
- Preserved rollback branch: `rollback/neir-citizen-pre-ux-service-20261104` — immutable reference to the old release.
- Production: https://shihab-tech04.github.io/NEIR-Citizen/
- **Verified independent Drive recovery ZIP:** https://drive.google.com/file/d/1hXRpwcvJRhoIsEjCqPcgjoH0NEOAKnhk/view?usp=drivesdk (92,010,131 bytes).
- GitHub Actions backup evidence: https://github.com/shihab-tech04/NEIR-Citizen/actions/runs/41704997103
- Uploaded ZIP digest SHA-256: `47c8dd7a77e1581bf0020698d0f4fb38c6e26a0a2fdeafa263437ea6b7c85927`.
- Internal `SHA256SUMS` PASS for full-history bundle/source archive; `git bundle verify`, full clone restore and source extraction PASS. Restored HEAD exactly `b56c8dc02ed4753aff1bac56fd73004c661f4a1a`.

## Scope of this isolated release
- Visibly separate citizen account signup from handset Special Registration using new home-only service cards and shared existing actions.
- Clarify the desktop and mobile header as **Create Account**, not the ambiguous **Register**.
- Add keyboard skip-to-main, focus managed on SPA route navigation, and reduced-motion-aware route scrolling.
- Use approved Poppins typography and existing Primary/Link button variants and teal tokens; preserve EN/BN and mobile/desktop parity.
- **Do not change** the IMEI search/checker, validation, result, data source, upload, Admin decisions, Citizen↔SQL, authentication logic, or official provider security.
- Current verified backend is *demo*: Supabase Auth user count 0, 2 demo users, `neir-demo-login` Edge Function. Until an authorized official phone/SIM-document verification provider exists, real verified signup and password reset cannot be represented as working. This release does not elevate demo identities or introduce bypasses.

## Rollback via protected workflow
1. Open the merged release PR and use **Revert** to produce a separate inverse PR.
2. Review the inverse diff; don't discard other commits, force-push `main`, disable branch protection or reset history.
3. Re-run TypeScript, accessibility, responsive, service/handoff, IMEI freeze and SQL regression checks; preserve another independent backup.
4. Merge via authorized workflow and verify deployed GitHub Pages `RELEASE_COMMIT.txt` is the intended rollback merge SHA.
5. If disaster recovery is needed, verify external ZIP checksum and restore-test its Git bundle, compare with preserved rollback branch.
