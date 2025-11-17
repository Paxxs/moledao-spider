# Project Context

## Purpose
Build a Python spider that republishes moledao.io job postings for internal use. The tool replays the captured job list/detail HTTP flows, normalizes the payload, and emits Microsoft Word documents (10 jobs per file) that recruiting can share with candidates and partners. Each run should:
- Load the most recent snapshots from `har/moledao.io_api_career_list.har` plus the detail HAR fixtures (and optionally hit the live APIs with retries if `--live` is passed).
- Transform the JSON payload so that preferences, job type, and experience fields map to their friendly text (per the lookup tables in this doc).
- Generate sequentially numbered Word bundles (`jobs-001.docx`, `jobs-002.docx`, …) where every job entry follows the mandated H1/H2 hierarchy and descriptive metadata block.
- Emit structured logs for every fetched record in the format `[Company][Role]-[Preference]`.

## Tech Stack
- Python 3.11+ with `venv` to keep dependencies isolated.
- `requests` (or `httpx`) for replaying the list/detail endpoints captured in the HAR files, paired with `tenacity` for retry/backoff when the CLI points at the live API.
- `beautifulsoup4` (or similar HTML sanitizer) to convert `career.content` HTML snippets to Word-ready text by stripping unsafe tags and normalizing whitespace.
- `python-docx` for DOCX generation, headings (H1/H2), and pagination plus a thin helper that batches jobs per file (exactly 10 per document).
- Standard `logging` configured for structured console/file output; logs should be UTF-8 safe so bilingual text (EN/中文) does not break pipelines.
- `click` (or argparse) for the CLI layer so users can pass output paths, verbosity, batching overrides, or a `--live` toggle without editing code.

## Project Conventions

### Code Style
- Follow PEP 8 with black-compatible formatting, descriptive snake_case names, and UTF-8 safe literals (docstrings/log strings may contain Chinese text when needed).
- Prefer explicit type hints for public functions; dataclasses wrap the career entities plus derived fields (preference/type/experience text, posting age).
- Keep modules ASCII-only and add short comments before non-trivial parsing, batching, or DOCX formatting blocks.
- Module boundaries:
  - `cli.py` (arg parsing + dependency wiring)
  - `clients.py` (list + details fetchers with HAR/live backends)
  - `models.py` (dataclasses + enums + mapping helpers)
  - `exporter.py` (Word batching, numbering, formatting)
  - `logging_utils.py` (structured log helpers)

### Architecture Patterns
- Thin CLI entry point orchestrates a pipeline of: loader (HAR playback or live HTTP) → mapper (`CareerRecord` dataclasses) → exporter (DOCX files).
- Data layer exposes `CareerListClient` and `CareerDetailsClient` abstractions so HAR playback and live API hits share the same interface; HAR fixtures behave like deterministic responses for integration tests.
- Output layer batches jobs in groups of 10; an `Exporter` service handles numbering, filename convention, header styling, and ensures leftover jobs still trigger a partial document.
- Domain logic (preference/type/experience mapping) sits in a `models` module so tests can cover it in isolation. Mappings follow:
  - Preferences (`career.preferences`): `1=Fully Remote`, `2=Hybrid`, `3=Temporary Remote`, `4=Office Only`.
  - Job type (`career.type`): `1=Full-time`, `2=Internship`, `3=Part-time`, `4=Freelancer`, `5=Student`.
  - Experience (`career.experience`): `1=No Experience`, `2=Fresh Graduate/Student`, `3=<1 Yr Exp`, `4=1-3 Yrs Exp`, `5=3-5 Yrs Exp`, `6=5-10 Yrs Exp`, `7=>10 Yrs Exp`.
- Location reduces to the country string derived from `career.country` (fallback to detail payload if list omits it).

### Testing Strategy
- Unit tests cover enum mapping, batching logic, filename generation, HTML-to-Docx formatting helpers, and log message formatting (ensuring `[Company][Role]-[Preference]` strings appear).
- Integration tests replay the provided HAR fixtures from `har/` to ensure parsing still succeeds when upstream JSON changes and that missing detail calls fail fast with actionable errors.
- Manual verification includes spot-checking generated Word files for heading hierarchy, bilingual text rendering, and verifying that each document contains at most 10 entries with correct numbering.
- Future regression tests can diff generated DOCX XML to detect formatting regressions without manual inspection.

### Git Workflow
- Default branch is `main`; every change lands through short-lived feature branches named `feature/<summary>`.
- Conventional commit prefixes (`feat:`, `fix:`, `chore:`, `docs:`) keep history scannable. Tie commits back to the OpenSpec `change-id` in body when relevant.
- Never rewrite shared history; rebase locally before opening a PR and squash only within feature branches before review.

## Domain Context
- Source data comes from moledao.io career APIs (`career_list` for summaries, `career_details` for full HTML content).
- Word layout per job:
  ```
  <COMPANY>              # H1
  <ROLE> (<Type>)        # H2
  Location: <Country>
  Type: <career.type lookup>
  Preferences: <career.preferences lookup>
  <postedAt relative text>
  Exp: <career.experience lookup>
  Tag: <career.tag>
  content: <career.content rendered from HTML>
  time: <updateDate>
  ```
- Each document holds exactly 10 jobs and filenames are numbered sequentially (e.g., `jobs-001.docx`, `jobs-002.docx`).
- Logs must emit at least `[Company][Role]-[Preference]` for every fetch/detail to aid support.
- HAR parsing needs to tolerate locale-specific commas/quotes and support future replacements when new HAR snapshots drop in the `har/` directory.
- Word files should default to UTF-8 fonts that render both English and Chinese text (Microsoft YaHei or Calibri fallback).
- Relative time strings (e.g., `13 hours ago`) are passed through from the API; when missing they default to ISO timestamps derived from `updateDate`.

## Important Constraints
- Keep scraping traffic polite by replaying HAR data by default; live requests must rate-limit and include retries.
- Ensure HTML content is sanitized before inserting into Word (strip scripts/inline styles).
- Word exports must preserve heading levels, location granularity (country only), and preference/type text derived from the provided lookup tables.
- CLI flags should allow choosing output directory and toggling verbose logging.
- Respect Chinese/English bilingual content but store files as UTF-8 DOCX.
- Batch export must be idempotent—rerunning with the same snapshot should overwrite the same `jobs-XYZ.docx` files unless `--append` is explicitly requested.
- Logging level defaults to INFO with optional `--verbose` for DEBUG. All logs should include timestamps and job identifiers.
- Configuration values (output dir, fetch mode, batch size) live in `pyproject.toml` or `.env` defaults but can be overridden via CLI flags.

## External Dependencies
- moledao.io career APIs (list + detail endpoints referenced in `har/moledao.io_api_career_list.har`, `moledao.io_api_career_details1.har` and `har/moledao.io_api_career_details2.har`).
- Python package index for `requests`, `beautifulsoup4`, `python-docx`, and testing tools (`pytest`).
- Local filesystem write access for `/output` (or configured path) where DOCX bundles are saved.
- Optional: `rich` for nicer CLI progress/log formatting during long scrapes.
