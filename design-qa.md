# Design QA — Registry Ledger rebuild

Date: 2026-08-27

Reference: Registry Ledger Option 1, 1487 × 1058

Implementation viewports:

- Database desktop: 1440 × 1024
- Database mobile: 390 × 844
- Project record desktop: 1440 × 1024
- Project record mobile: 390 × 844
- Comparison desktop: 1440 × 1024

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
| Functional states | Pass | Search/filter controls, record selection, two-record comparison, detail actions, empty states, and 404s are represented. |
| Data honesty | Pass | Missing evidence, history, relationships and ranking eligibility remain explicit; no placeholder score or inferred fact is shown. |
| Browser health | Pass | No browser warnings or errors were reported during the tested flows. |

## Findings resolved

- P1: Generic comparison redirects previously had no destination pages. Added live curated and user-selected comparison routes.
- P1: Project records returned a soft missing state. Missing dossiers now resolve through the branded 404 with an HTTP 404 status.
- P2: Database filters and results competed on mobile. Filters now collapse and result records remain immediately visible.
- P2: Zero observations could display a full progress rail. The rail now reflects the actual state.

Final result: passed

## System consistency audit — 2026-08-27

Audit evidence: `/tmp/openagent-design-audit-2026-08-27`

| Flow | Health | Verification |
| --- | --- | --- |
| Homepage baseline | Healthy | Shared header, navigation rhythm, color tokens, typography and footer establish the system baseline. |
| Database browsing | Healthy | Filters remain available without consuming the workspace; results and inspector scroll independently on desktop. |
| Project dossier | Healthy | Shared navigation and typography now frame the evidence, history and relationship data consistently. |
| Primary navigation | Healthy | Homepage and internal routes now render the same three labels and the same three destinations. |
| Sources, About, landing and comparison pages | Healthy | Legacy serif typography, dark footer and duplicate navigation treatments were removed. |
| Mobile reflow | Healthy | Homepage, Database and project dossier were checked at 390 × 844 with no horizontal overflow. |

### Findings resolved

- P1: Homepage and internal pages used different navigation, typography, color and footer systems. All public routes now use one shared shell derived from the homepage.
- P1: Database used document-level scrolling, so filters and record context disappeared during comparison work. Desktop now uses a bounded workspace with independently scrolling results and inspector panes.
- P1: Filter density consumed too much of the first viewport at common laptop widths. Filters collapse into a persistent summary below 1280 px and expand on demand.
- P2: Record selection and comparison state were lost during repeated browsing. Result scroll position and comparison choices now persist per filter state.
- P2: Mobile record selection behaved like a desktop inspector interaction. Mobile entity titles now open the full dossier directly and expose a clear secondary dossier link.
- P2: Several labels and metadata blocks were too small for sustained data reading. Microcopy sizes and contrast were normalized across the shared system.

### Accessibility verification boundary

Responsive reflow, visible focus styling, semantic links and controls, contrast, and browser-console health were checked. This pass does not claim complete screen-reader, keyboard-only, or formal WCAG conformance; those require a dedicated assistive-technology audit.

Final system consistency result: passed

## Navigation correction audit — 2026-08-27

Audit evidence: `/tmp/openagent-nav-audit-2026-08-27`

The earlier consistency audit incorrectly treated a shared Header component as proof of navigation consistency. The component contained two route-dependent navigation definitions, so the visual shell was shared while destinations were not. This correction verifies rendered labels, href values and active states instead of component reuse alone.

| Step | Health | Verification |
| --- | --- | --- |
| 1. Production homepage navigation | Failed before correction | Rankings and Signals targeted homepage anchors; Agents and Robotics targeted Database filters. |
| 2. Production Database navigation | Failed before correction | The same labels targeted separate Rankings, Changes and SEO landing pages. |
| 3. Unified primary navigation | Healthy after correction | All routes use Agents, Robotics and Database from one configuration with identical href values. |
| 4. Navigation state | Healthy after correction | Agent and Robotics filter views activate their own navigation item; the unfiltered registry activates Database. |
| 5. Database status strip | Healthy after correction | Desktop height reduced from 84 px to 56 px; mobile height is 49 px and secondary statistics are removed from the mobile first viewport. |
| 6. Retired routes | Healthy after correction | Rankings and Changes pages were removed from source and sitemap; permanent redirects preserve old inbound links. |

Accessibility boundary: responsive reflow, horizontal overflow, link state and browser-console health were checked. Full keyboard-only and assistive-technology testing remain outside this pass.

---

# Humanity Countdown — Design QA

- Source visual: `/Users/boyangxie/.codex/generated_images/01a04e05-bc2c-79e1-8cf0-769eeb456a22/exec-cfdc639c-190c-41cc-a87d-593fb7de0bd4.png`
- Implementation screenshot: `/Users/boyangxie/Documents/OpenAgent.Bot/output/humanity-game/redesign/post-vote-desktop.png`
- Combined comparison: `/Users/boyangxie/Documents/OpenAgent.Bot/output/humanity-game/redesign/source-comparison.png`
- Comparison viewport: 1487 × 1058 CSS pixels
- Mobile verification: 390 × 844 CSS pixels (`pre-vote-mobile.png`, `post-vote-mobile.png`, `taken-mobile.png` under `output/humanity-game/redesign/`)

## Comparison history

1. First implementation pass was too sparse, placed the countdown at the far left, and let the hero image overlap the vote controls.
2. Constrained the editorial object to its measured stage, moved the countdown into the top composition, enlarged the post-vote object and crowd, and restored the source target's outlined/share and dark/next action pair.
3. Reprocessed all three editorial images as transparent cutouts, removing visible rectangular image backgrounds.
4. Re-captured the post-vote state at the source visual's viewport and judged both images together. The implementation now preserves the target's hierarchy, warm editorial field, central object, two-sided crowd, 75% line, highlighted player position, dominant score, and compact action row. The deliberate difference is that the implementation uses cleaner representative canvas tokens so the crowd can animate and accurately update from live vote percentages.
5. Checked the pre-vote state separately to confirm that no percentages, totals, crowd, or side distribution appear before the player votes.
6. Checked mobile pre-vote, revealed crowd, and TAKEN event states; all remain inside a single gameplay viewport with working controls.

final result: passed
