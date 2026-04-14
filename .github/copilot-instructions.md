# Copilot Instructions — scikit-build.github.io

Hugo site for [scikit-build.org](https://scikit-build.org). Uses the [PaperMod](https://github.com/adityatelange/hugo-PaperMod) theme loaded as a Hugo module (not a git submodule).

## Commands

```bash
# Build the site (output to public/)
hugo build

# Live-reload dev server (drafts included)
hugo server --buildDrafts

# Build for production (minified, correct baseURL)
hugo --minify --baseURL "https://scikit-build.org/"

# Update Hugo module dependencies
hugo mod tidy
```

> Hugo v0.146.0+ and Go are both required (PaperMod enforces this at build time).

## Architecture

The home page is fully custom — it does **not** use PaperMod's built-in list or profile modes.

| File | Role |
|---|---|
| `layouts/index.html` | Custom home page template (hero + project cards grid). Overrides PaperMod's default list layout for the home page only. |
| `data/projects.yaml` | Single source of truth for all project cards. Iterated via `{{- range hugo.Data.projects }}` in the template. |
| `assets/css/extended/homepage.css` | Custom CSS loaded automatically by PaperMod from `assets/css/extended/`. Uses PaperMod CSS variables (`--border`, `--primary`, `--theme`, `--entry`, `--secondary`) for automatic dark mode support. |
| `hugo.toml` | Site config, PaperMod params, and nav menu. |

PaperMod layouts (in the Hugo module cache) can be browsed after running `hugo mod vendor`, which writes them to `_vendor/` (gitignored).

## Key Conventions

**Adding a project card:** Add an entry to `data/projects.yaml`. Supported fields:
- `name` (required), `description` (required), `github` (required)
- `docs` — if present, a Docs badge appears on the card
- `pypi` — if present, a PyPI badge appears on the card
- `primary: true` — renders a highlighted "Core" badge and thicker border

**Adding a new page** (e.g. tutorials): Create `content/tutorials/my-page.md` with front matter. Add a `[[menu.main]]` entry in `hugo.toml` to surface it in the nav. PaperMod's standard `single.html` layout is used automatically.

**CSS:** All custom styles go in `assets/css/extended/`. Files here are automatically concatenated and minified by PaperMod — no import needed. Always use PaperMod's CSS variables rather than hard-coded colours so dark mode works for free. The hero logo uses `filter: invert(1)` under `.dark` to remain visible on dark backgrounds.

**Logo assets** live in `static/images/` (SVGs) and `static/` (favicon PNG), sourced from the [scikit-build/scikit-build](https://github.com/scikit-build/scikit-build/tree/main/docs/logo) repo:
- `scikit_build_logo.svg` — wide lockup used in the hero (1167×262.6)
- `scikit_build_mark.svg` — square mark used in the nav header (`params.label.icon`)
- `favicon.png` — mark PNG used as site favicon (`params.assets.favicon*`)

**Hugo module updates:** The theme is pinned via `go.sum`. Run `hugo mod get github.com/adityatelange/hugo-PaperMod@master && hugo mod tidy` to update it.

**Deployment:** Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds with Hugo (extended) and deploys to GitHub Pages via the Actions Pages API. No manual publish step needed.
