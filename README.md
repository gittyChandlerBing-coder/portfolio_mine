# Adi's Portfolio — 3D Japanese Shop (static build)

Plain HTML + JS, no React, no bundler, no build step. Three.js loads
straight from a CDN via an import map, so this is a single file you can
open locally or host anywhere that serves static files.

## Deploy to GitHub Pages

1. Create a new GitHub repo (or reuse one), e.g. `portfolio-3d`.
2. Put `index.html` at the **root** of the repo (this is required — GitHub
   Pages serves `index.html` from the root or from `/docs`, and this file
   does not execute as `.jsx`, it's already plain HTML/JS).
3. Commit and push:
   ```bash
   git init
   git add index.html
   git commit -m "Deploy 3D portfolio"
   git branch -M main
   git remote add origin https://github.com/<your-username>/portfolio-3d.git
   git push -u origin main
   ```
4. On GitHub: **Settings → Pages → Source → Deploy from a branch → main → / (root) → Save**.
5. Your site goes live at `https://<your-username>.github.io/portfolio-3d/`
   (usually within ~1 minute).

## Editing project links

Open `index.html` and edit the `PROJECTS` array near the top of the
`<script type="module">` block — each entry controls the name, URL,
tagline, kanji, and color scheme of one banner.

## Notes

- Requires a browser with WebGL and ES module support (all modern
  browsers). No install, no `npm run build`.
- If you ever want to self-host Three.js instead of the CDN, download
  `three.module.js` into the repo and change the `importmap` URL in
  `<head>` to point at it.
