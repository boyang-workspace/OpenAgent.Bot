# Microduck intake — 2026-08-28

## Records and ownership

| Slug | Artifact | Robotics layer | Automated repository metrics |
| --- | --- | --- | --- |
| microduck | Physical robot, biped | Platform | None; linked software owns its metrics |
| microduck-runtime | Rust runtime and control software | Stack / runtime | pollen-robotics/microduck |
| microduck-rl | Training environments and export tools | Stack / training-infrastructure | pollen-robotics/microduck_rl |
| microduck-policies | ONNX policy collection | Intelligence / policy-model | None; do not duplicate the runtime repository |

Use cases are many-to-many, source-attributed facets. They do not create new top-level navigation or duplicate entities. `/database?use_case=sim-to-real` and the equivalent `/api/v1/entities.json` parameter filter across artifact types.

Resource manifests live in `current_facts` under `resources.*` and retain observation history and source attribution. The public dossier JSON exposes a validated `resources` projection. Policy file URLs are commit-pinned; `gitBlobSha` is a Git blob SHA, not a raw-file SHA-256 checksum. Do not count individual files as projects.

## Evidence and limits

- [Official press kit](https://pollen-robotics.com/microduck/press-kit/): explicitly limits the open-source claim to software. Mechanical/electronic design files are not open. It also specifies 15 DOF, 25 cm height and provisional specifications.
- [Runtime](https://github.com/pollen-robotics/microduck): Apache-2.0 software. Repository metrics belong to the runtime record.
- [RL README](https://github.com/pollen-robotics/microduck_rl/blob/d424a0c899f6b33cbd3daeb279913134349c0b63/README.md): Apache-2.0 code, separate Creative Commons BY-SA-NC terms for 3D model files. The version of those terms is unspecified; do not invent an SPDX version.
- [Policy manifest](https://github.com/pollen-robotics/microduck/tree/590b986bd8c0d50ae02cb3ea2f59c463b6828168/policies): nine ONNX files, distinct from the site's seven marketed behaviours. Input `[1,61]`, output `[1,14]`. These dimensions are not the robot's full mechanical DOF count. The root repository is Apache-2.0; a separate weight-specific license was not found, so weights are conservatively marked partial/source-available.
- No official training dataset was confirmed in the reviewed sources. Simulation geometry and policy weights must not be classified as datasets.
- The $399 USD offer is an introductory pre-order price excluding tax/shipping. Before-Christmas delivery is a manufacturer's target, not stock availability or a guarantee.

## Update boundary

The existing daily GitHub sync picks up the two new subscriptions. A fresh GitHub baseline is included in the seed migration. Product specifications, offers, use-case evidence and file manifests are reviewed snapshots; they do **not** yet have automated extraction/re-review. Their own observation dates remain visible independently of repository freshness.

For later updates, create new observations and update current facts; never rewrite this historical seed or silently change its source dates. Profile metadata is currently a curated display projection of facts, so fact changes must also update affected profile fields. A future generic intake flow should validate and maintain that projection.

## Verification

- 40 tests pass, including full SQLite migration replay, preservation of all pre-existing robotics profiles, source hashes, domain/layer/use-case filtering, bidirectional evidence and metric ownership.
- Astro check: no errors or warnings. Production build passes.
- Local browser: desktop 1440px and mobile 390px, no document overflow; official image loads; nine policy resources render; use-case form reduces results from four to one as expected.
- Production migrations 0013/0014 applied successfully. Cloudflare deployment: `1b65ca6c-37bb-44f0-b3ec-a020335997bf`.
- All four production HTML and JSON routes return 200; sim-to-real filtering returns the four intended records; sitemap includes Microduck. The runtime/RL records have metrics, while the robot/policy collection correctly have none.
