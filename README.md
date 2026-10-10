# site/

Sources for the public `eureka401.github.io` repo (D12, Q14). Copy the contents of this folder to the root of that repo; GitHub Pages serves it. Owner steps: `docs/ENVIRONMENT.md`, row M1-11 and the "M1-11" section.

- `index.html`, `privacy.html`, `terms.html`, `404.html`, `style.css`: static pages, no scripts, no trackers, no external fonts or images. The look follows `docs/design/DESIGN.md` §2 and §4 (SITE-01 refurbished it on the owner's request).
- `app-ads.txt`: placeholder until the AdMob account exists (M2).
- Contact in `privacy.html` and `terms.html`: `kyslap.app@gmail.com` (the owner's public app address, 2026-09-30).
- Published by copying these files to the root of `eureka401.github.io` (first published 2026-09-30, INT-0j).
- The app links to `https://eureka401.github.io/privacy` and `/terms` (extensionless; Pages serves `privacy.html` at both).
- Any PR that adds an SDK or data flow edits `privacy.html` (A5).
- SITE-01 (2026-10-10) rewrote both legal pages against the code on `main` and the research in `docs/research/legal-pages.md`; the "Draft" label stays until the owner says otherwise.
- Every page carries `<meta name="color-scheme" content="light dark">`, and `style.css` sets background and text colour together in both schemes. Check a change at 360 and 320 px wide, in light and dark, at 200% text, with no horizontal scroll.
