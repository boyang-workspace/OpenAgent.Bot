# YUP

OpenAgent.Bot is now the home of YUP — the stone head online.

- Production: https://www.openagent.bot/
- Origin: https://www.openagent.bot/origin/
- Stickers: https://www.openagent.bot/stickers/
- Memes: https://www.openagent.bot/memes/
- Archive: https://www.openagent.bot/archive/

The former OpenAgent database application has been retired from this repository.

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

Cloudflare Workers serves the static output. Legacy `/yup/*`, `/reactions/*`, and
`/sightings/*` links redirect to their new canonical routes.

## Preserved working assets

- `public/assets/yup/` — YUP character and sticker assets
- `design-assets/yup/` — source sprite sheets
- `scripts/extract-yup-sprites.py` — transparent sprite extraction utility
