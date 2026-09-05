# YUP site direction prototype

Static, dependency-free concept site for reviewing the next YUP design direction.

From the repository root:

```bash
python3 -m http.server 4324
```

Then open `http://127.0.0.1:4324/yup-prototype/`.

Pages:

- Home / YUP Now
- Origin
- Stickers (the legacy `/reactions/` route renders the same collection)
- Memes (data-driven grid; the legacy `/sightings/` route renders the same collection)
- Archive (selected-work portfolio)
- Search (client-side index covering pages, stickers, memes, and work)

This is a design prototype, not a production deployment. All interactions and responsive layouts are implemented in plain HTML, CSS and JavaScript so the direction can be reviewed before choosing a production stack.

The hero uses the project-owner supplied `YUP_head.svg`, adapted only to expose separate eye groups so its pupils can track the pointer horizontally without moving outside the brow lines. The YUP NOW illustration uses a high-resolution, transparent refinement of the original typing pose.

Image usage shown in the footer: download and use in original form only; editing, alteration and derivative works are not permitted.
