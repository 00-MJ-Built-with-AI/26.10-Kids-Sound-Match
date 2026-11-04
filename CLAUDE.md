# Working on this repo

- Commit and push straight to `main`. Don't open branches or ask before pushing: every push to `main`
  is published by Vercel (https://kids-sound-match.vercel.app), and that is what the owner wants.
- Before pushing: `npm test` and `npm run build:test` must pass, and check new screens in a browser.
- Record every agreed change in `docs/DECISIONS.md`.
- Pictures drawn for the app come from the scripts in `tools/art/` (see `child-lib.mjs`); change the
  script and regenerate rather than editing the SVGs by hand.
