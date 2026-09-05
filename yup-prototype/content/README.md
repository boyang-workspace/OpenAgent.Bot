# YUP content guide

These JSON files are the content source of truth. The collection pages and global
search read the same records, so a new item becomes searchable automatically.

## Add a sticker

1. Put the transparent PNG under `public/assets/yup/sprites/<category>/`.
2. Add one record to `stickers.json` with a unique three-digit `id`.
3. Use one of: `expressions`, `actions`, or `props`.

## Add a meme

1. Put the image under `public/assets/yup/web/`.
2. Add one record to `memes.json` with a unique `id`, title, tag, and short line.

## Add an archive work

1. Put the image under `public/assets/yup/` or one of its subfolders.
2. Add one record to `archive.json` with a stable slug-like `id`.
3. Set `wide` to `true` only when the work should span both portfolio columns.

Run `npm run check` before publishing. It rejects missing fields, duplicate IDs,
unknown sticker categories, and missing image files.
