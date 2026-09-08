# YUP

OpenAgent.Bot is the project portal, with YUP — the stone head online — as its first published project.

- Project portal: https://www.openagent.bot/
- YUP: https://www.openagent.bot/yup/
- Origin: https://www.openagent.bot/yup/origin/
- Stickers: https://www.openagent.bot/yup/stickers/
- Memes: https://www.openagent.bot/yup/memes/
- Archive: https://www.openagent.bot/yup/archive/

The former OpenAgent Database application and its production data stores have been permanently retired. Its public routes return `410 Gone` so crawlers remove them from their indexes. The portal, `/yup/*`, analytics, and future project paths remain active.

## Content updates

The site is static, but its collections are maintained as structured content:

- `yup-prototype/content/stickers.json`
- `yup-prototype/content/memes.json`
- `yup-prototype/content/archive.json`
- `yup-prototype/content/pages.json`

Images live in `public/assets/yup/`. The build validates every referenced image,
copies the production site to `dist/`, and the same content feeds both collection
pages and site search.

```bash
npm install
npm run check
npm run build
npm run dev
npm run deploy
```

Cloudflare Workers serves the static output. The root stays the multi-project portal,
YUP stays under `/yup/*`, and older YUP aliases redirect to their canonical YUP routes.

## Preserved working assets

- `public/assets/yup/` — YUP character and sticker assets
- `design-assets/yup/` — source sprite sheets
- `scripts/extract-yup-sprites.py` — transparent sprite extraction utility
