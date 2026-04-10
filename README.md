# flags.fyi

A web compendium of vexillology (flag study), by Flagstaff.

## Architecture

This is a **static site** — no framework, no build step required for deployment.
The repository itself is the deployable content for GitHub Pages.

- **HTML pages** are pre-generated from flag data using `build.js`
- **Bulma CSS** and **Font Awesome** loaded from CDN
- **Minimal vanilla JS** (`app.js`) for keyboard navigation and mobile menu
- **Zero runtime dependencies** — `build.js` uses only Node.js built-ins

## How it works

1. Flag metadata lives in `data/flags.json`
2. Per-flag details (colors, descriptions, articles) live in `assets/flags/{namespace}/`
3. `build.js` reads the data, renders Markdown, and generates static `{flagId}/index.html` pages
4. SVG flag images are copied from `assets/flags/` into each flag directory
5. The result is a flat structure where `source = deployable output`

## Development

### Rebuild pages after editing data

```bash
node build.js
```

No `npm install` needed — the build script has zero dependencies.

### Preview locally

```bash
npx serve . -l 3000
# or
python3 -m http.server 3000
```

### Keyboard shortcuts (on flag pages)

- `←` or `p` — Previous flag
- `→` or `n` — Next flag
- `i` — Flag index

## Directory structure

```
├── data/               # Source data (flags.json, meta.json, etc.)
├── assets/flags/       # Flag SVG/PNG images and per-flag JSON/MD
├── build.js            # Static site generator (Node.js, zero deps)
├── style.css           # Custom CSS (Bulma from CDN)
├── app.js              # Minimal JS (keyboard nav, burger menu)
├── index.html          # Landing page
├── flag-index/         # Flag listing page
├── {flagId}/           # Per-flag pages
│   ├── index.html      #   Generated page
│   └── flag.svg        #   Flag image (copied from assets/)
├── flags.json          # Flag data (also served as API)
├── CNAME               # GitHub Pages custom domain
└── .nojekyll           # Disable Jekyll processing
```

## Deployment

Push to `gh-pages` (or configure GitHub Pages to serve from the default branch).
Since source = output, no CI/CD build step is needed.

## License

MIT
