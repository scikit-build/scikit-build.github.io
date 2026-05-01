# AGENTS.md — scikit-build.github.io

Hugo static site for [scikit-build.org](https://scikit-build.org).

## Prerequisites

- **Hugo (extended)** v0.146.0+
- **Go** (theme is a Hugo module, not a submodule)

## Commands

```bash
# Dev server (live reload, drafts included)
hugo server --buildDrafts

# Build for production (minify, correct baseURL)
hugo --minify --baseURL "https://scikit-build.org/"

# Update PaperMod theme to latest
hugo mod get github.com/adityatelange/hugo-PaperMod@master && hugo mod tidy
```

## Architecture

- **`layouts/index.html`** — fully custom home page (overrides PaperMod list layout). Pulls project cards from `data/projects.yaml`.
- **`data/projects.yaml`** — single source of truth for project cards. Fields: `name`, `description`, `github`, `docs`, `pypi`, `labels`.
- **`content/events/`** — events section with custom `layouts/events/` templates.
- **`assets/css/extended/`** — custom CSS auto-loaded by PaperMod. No import needed. Use PaperMod CSS variables (`--border`, `--primary`, `--theme`, `--entry`) for free dark mode support.
- **Logos** are in `static/images/` from the upstream `scikit-build/scikit-build` repo. Do not rename; `layouts/index.html` and `hugo.toml` reference them by path.

## Conventions

- **Adding a project card:** edit `data/projects.yaml` only.
- **Adding a page:** create `content/<section>/<page>.md` with front matter, then add a `[[menu.main]]` entry in `hugo.toml`.
- **CSS:** always add to `assets/css/extended/`. Never hard-code colors — use PaperMod variables.
- **Prettier** is enforced via pre-commit (`.pre-commit-config.yaml`). Run `pre-commit run --all-files` before pushing.

## Deployment

Push to `main` triggers `.github/workflows/deploy.yml`, which builds with Hugo (extended) and publishes to GitHub Pages. No manual step needed.
