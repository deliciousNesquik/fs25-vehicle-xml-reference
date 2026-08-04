# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

A documentation-only project: a Russian-language reference for the vehicle/equipment XML of
**Farming Simulator 25** (`modDesc.xml` + vehicle XML blocks), published as an Astro **Starlight**
site to GitHub Pages. There is no application code and no test suite — the deliverable is Markdown
under `src/content/docs/`, and `astro build` is the only check that matters.

Scope discipline matters here: the reference documents **XML markup only** (attributes,
sub-elements, defaults, examples). Lua appears only where a page is explicitly about it
(`recipes/custom-paint.md`). Facts come from the game's own source (e.g. `Vehicle.lua`,
`vehicles/specializations/Cultivator.lua`, `register*XMLPaths`) — never invent attributes or defaults.

## Commands

Astro 7 requires Node **22.12+**. If the shell's default `node` is older, a local install lives at
`~/.local/lib/nodejs/node22/bin` — prepend it to `PATH`.

```bash
npm install
npm run dev        # dev server; search is NOT available here
npm run build      # the real check: content validation + link rewriting + Pagefind index
npm run preview    # serve dist/ — use this to test search
```

CI (`.github/workflows/deploy.yml`) runs `npm ci && npm run build` on Node 22 and publishes `dist/`
to GitHub Pages on every push to `main`.

## Architecture

Three files decide how the site behaves; everything else is content.

- **`astro.config.mjs`** — the whole navigation tree (`sidebar`), locales, `base` path, redirects.
  Directories under `src/content/docs/` determine URLs; the sidebar decides *grouping*, so a page can
  move between branches of the tree without changing its address. Starlight validates every sidebar
  `slug`: a typo or a deleted page fails the build. A page missing *from* the sidebar is not an
  error — it just won't appear in the tree.
- **`src/plugins/remark-doc-links.mjs`** — rewrites relative `.md` links to real URLs at build time,
  so cross-page links stay readable on GitHub *and* work on the site. A link to a nonexistent file
  throws and fails the build. This is why inter-page links must be written as relative `.md` paths
  (`../mod-desc/l10n.md`), never as site-absolute URLs.
- **`src/content.config.ts`** — the Starlight docs collection (`docsLoader` + `docsSchema`). Files
  starting with `_` are ignored by the loader, which is why `_template.md` can live inside the
  content directory.

Content layout:

```
src/content/docs/
├── index.mdx          landing page (CardGrid of entry points)
├── start/             how-to-read (notation), tag-index (A→Z index of every documented tag)
├── mod-desc/          elements of modDesc.xml
├── base/              blocks common to any vehicle
├── specializations/   per-specialization blocks
├── concepts/          engine mechanisms (parentFile, CDATA, XML declaration, configurations)
├── recipes/           whole tasks (localization, custom vehicle type, custom paint)
└── _template.md       page skeleton, not published
```

Choosing a location: `mod-desc/` for anything read out of `modDesc.xml`; `base/` for blocks present
on any vehicle; `specializations/` for a block owned by one specialization; `concepts/` for engine
mechanisms that are not a single block; `recipes/` for task-shaped pages that link the reference
together. `concepts/vehicle-configurations` is deliberately shown under *vehicle.xml* in the tree
while keeping its `concepts/` URL — nav position and URL are independent by design.

Adding a page means touching **two** places: the file itself and the `sidebar` in
`astro.config.mjs`. If it introduces new tags, also add rows to `start/tag-index.md`.

## Page conventions

All prose is **Russian**. Commit messages are **English**, imperative, one line
(`Add modDesc bales element reference (...)`).

Follow the real pages (`specializations/cultivator.md`, `base/components.md`, `mod-desc/root.md`);
`_template.md` is the skeleton:

- Frontmatter: `title` (page H1 — plain text, so no backticks and no footnote refs), `description`
  (one line, feeds search results and `<meta>`), `sidebar.label` (the short tag name that appears in
  the tree). **Always quote YAML values** — descriptions contain `:` and `#`, which break unquoted
  YAML silently.
- A canonical XML snippet comes first, right after the frontmatter, before any prose — present the
  authoritative shape, then explain it.
- Then one or two paragraphs of purpose and a blockquote locating the block:

  ```markdown
  > Расположение: блок `vehicle.cultivator`. Раздел справочника — Specializations.
  ```

  Add a `Источник схемы: <Lua function>` line when the registration point is worth citing.
- Numbered `## N. …` sections separated by `---`. Typical spine: what it is → attributes →
  sub-elements → examples → GIANTS Editor node layout → `Типичные ошибки` → `Примечания`.
- Attribute tables use `| Атрибут | Тип | По умолчанию | Описание |` (or `| Путь | … |` for XML
  paths). Path notation matches the engine: `#attr`, `.child#attr`, `(?)` for indexed elements. It is
  documented once in `start/how-to-read.md` — link there instead of re-explaining it.
- Pages end with `## Глоссарий`: footnote definitions for the types and terms used. Reuse the
  existing ids — `[^bool]`, `[^int]`, `[^float]`, `[^string]`, `[^node]`, `[^vec3]`, `[^i3d]`,
  `[^l10n]`, `[^xsd]`, `[^giantseditor]`. Every definition needs a reference in the body: a
  definition whose only reference sat in a removed line renders as nothing.

## Content rules

- **FS25 only.** A deliberate cleanup (commit `4a1e405`) removed every FS22/FS19/FS17 mention and all
  version-comparison prose. Describe current behaviour; mark superseded forms inline as
  `Устаревшее: <old> → <new>`.
- Prefer the engine's real behaviour and defaults over describing a user's pasted example; when an
  example is wrong, present the correct authoritative form rather than critiquing it (commit
  `3666ad5`).
- Say explicitly when something is unverified instead of guessing (e.g. the `wildlife` page notes
  that the species file schema is not publicly confirmed).
- Licence is CC BY-SA 4.0 and covers the reference text; XML tag/attribute names and engine facts
  belong to GIANTS Software.

## Search and i18n

Search is Pagefind, built during `astro build`, with **separate `ru` and `en` indexes** (chosen by
`<html lang>`). It indexes the whole page body — attribute tables and XML examples included — so
`useDeepMode` or `DEFAULT_CULTIVATOR_WORK` are findable. Nothing needs doing per page beyond writing
a useful `description`.

Russian is the root locale (no URL prefix); `en` exists as a locale with a language switcher, and
untranslated pages fall back to Russian. A translation is a file at the same path under
`src/content/docs/en/`. Sidebar group labels carry `translations: { en: '…' }` in the config; add both
when introducing a group.
