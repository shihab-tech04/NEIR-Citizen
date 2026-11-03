# NEIR Citizen — Segment 1 Rollback Checkpoint (2026-11-04)

## Frozen production baseline
- Repository: `shihab-tech04/NEIR-Citizen`
- Exact verified pre-change `main` commit: `2f7c1dec98364eea6af1bec56d6fac3c42dba2e7`
- Dedicated unchanged rollback branch: `rollback/neir-citizen-pre-segment1-a11y-20261104`
- Production Pages entry: https://shihab-tech04.github.io/NEIR-Citizen/
- Independent restorable pre-release full Git-history/source backup is a required release gate; retain the verified Drive archive and checksum/restore evidence separately from the repository.

## Scope of this isolated release
**Only:** navigation/header contrast, direct small-screen Register access, mobile header touch targets, EN/BN document language, reduced-motion hero *illustration* fallback and browser metadata.

**Frozen:** all IMEI verification fields, labels, validation, action, search result, backend/data behavior, mobile IMEI layout, approved hero composition, logo art, Login/Register modal flows and Citizen/Admin/SQL synchronization.

The browser regression gate `scripts/neir-segment1-header-a11y.test.mjs` computes a fingerprint of the complete IMEI component region and fails if that region changes.

## Easy, safe rollback after release
1. Open the release PR in GitHub and use **Revert** to create the inverse PR against `main`. Do **not** force-push, reset the protected branch, disable checks or overwrite later unrelated commits.
2. Review that the inverse PR changes only files/lines from this specific release. Run the same frontend, integration, responsive and visual checks and preserve a new backup before release.
3. Merge through normal protected workflow, deploy GitHub Pages and verify public `RELEASE_COMMIT.txt` and affected journeys.
4. For disaster recovery, use the independent full-history Drive backup and verify its checksum/restored HEAD before restoring; compare with the unchanged rollback branch `2f7c1dec`.
5. If parallel changes land before rollback, revert only this release commit instead of treating the rollback branch as permission to replace other work.

## Status rules
- A rollback branch or prepared PR alone is not a live rollback.
- The current pre-release production state remains preserved at `2f7c1dec` unless and until a later authorized merge and public deployment are verified.
