# Design QA — Registry Ledger rebuild

Date: 2026-08-27

Reference: Registry Ledger Option 1, 1487 × 1058

Implementation viewports:

- Database desktop: 1440 × 1024
- Database mobile: 390 × 844
- Project record desktop: 1440 × 1024
- Project record mobile: 390 × 844
- Comparison desktop: 1440 × 1024
- Rankings desktop: 1440 × 1024

## Reference comparison

The reference and the desktop Database implementation were normalized and placed side by side in one comparison image. The implementation preserves the reference's compact masthead, dense filter rail, ledger table, acid verification marks, restrained neutral palette, and persistent record inspector. Differences in row order and metric history are live-data differences, not layout substitutions.

## QA rubric

| Area | Result | Notes |
| --- | --- | --- |
| Visual hierarchy | Pass | The database results and selected record lead; no oversized marketing hero remains. |
| Typography | Pass | Sans and mono carry product data; display serif is no longer used for primary database or record headings. |
| Spacing and density | Pass | Desktop rows remain scannable; mobile results appear before expanded filters. |
| Color and contrast | Pass | Acid is reserved for active/verified states and actions; body text and rules maintain readable contrast. |
| Module relationships | Pass | Filters feed the ledger, selection feeds the inspector, and comparison checkboxes feed the comparison route. |
| Responsive behavior | Pass | Database and project record were inspected at 390 × 844 without clipped primary actions or hidden results. |
| Functional states | Pass | Search/filter controls, record selection, two-record comparison, detail actions, empty states, 404s, and ranking gates are represented. |
| Data honesty | Pass | Missing evidence, history, relationships and ranking eligibility remain explicit; no placeholder score or inferred fact is shown. |
| Browser health | Pass | No browser warnings or errors were reported during the tested flows. |

## Findings resolved

- P1: Generic comparison redirects previously had no destination pages. Added live curated and user-selected comparison routes.
- P1: Ranking page expressed methodology but did not expose collection readiness. Added live gates, cohort sizes, coverage, source and observation states.
- P1: Project records returned a soft missing state. Missing dossiers now resolve through the branded 404 with an HTTP 404 status.
- P2: Database filters and results competed on mobile. Filters now collapse and result records remain immediately visible.
- P2: The rankings masthead and gate cards occupied too much of the first viewport. Reduced their vertical footprint.
- P2: Zero observations could display a full progress rail. The rail now reflects the actual state.

Final result: passed
