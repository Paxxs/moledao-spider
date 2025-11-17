# Project Context

## Purpose
Build a Python spider that republishes moledao.io job postings for internal use. The tool replays the captured job list/detail HTTP flows, normalizes the payload, and emits Microsoft Word documents (10 jobs per file) that recruiting can share with candidates and partners.

## Tech Stack
- Python 3.11+
- `requests` (or `httpx`) for replaying the list/detail endpoints captured in the HAR files
- `beautifulsoup4` (or similar HTML sanitizer) to convert `career.content` HTML snippets to Word-ready text
- `python-docx` for DOCX generation, headings (H1/H2), and pagination
- Standard `logging` configured for structured console/file output

## Project Conventions

### Code Style
- Follow PEP 8 with black-compatible formatting and descriptive snake_case names.
- Prefer explicit type hints for public functions; dataclasses wrap the career entities.
- Keep modules ASCII-only and add short comments before non-trivial parsing or formatting blocks.

### Architecture Patterns
- Thin CLI entry point (`main.py`) orchestrates a pipeline of: loader (HAR playback) → mapper → exporter.
- Data layer exposes `CareerListClient` and `CareerDetailsClient` abstractions so HAR playback and live API hits share the same interface.
- Output layer batches jobs in groups of 10; an `Exporter` service handles numbering, filename convention, and `python-docx` styling.
- Domain logic (preference/type/experience mapping) sits in a `models` module so tests can cover it in isolation.

### Testing Strategy
- Unit tests cover enum mapping, batching logic, filename generation, and text formatting helpers.
- Integration tests replay the provided HAR fixtures from `har/` to ensure parsing still succeeds when upstream JSON changes.
- Manual verification includes spot-checking generated Word files for heading hierarchy and logging output.

### Git Workflow
- Default branch is `main`; every change lands through short-lived feature branches named `feature/<summary>`.
- Conventional commit prefixes (`feat:`, `fix:`, `chore:`) keep history scannable.
- Never rewrite shared history; rebase locally before opening a PR.

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

## Important Constraints
- Keep scraping traffic polite by replaying HAR data by default; live requests must rate-limit and include retries.
- Ensure HTML content is sanitized before inserting into Word (strip scripts/inline styles).
- Word exports must preserve heading levels, location granularity (country only), and preference/type text derived from the provided lookup tables.
- CLI flags should allow choosing output directory and toggling verbose logging.
- Respect Chinese/English bilingual content but store files as UTF-8 DOCX.

## External Dependencies
- moledao.io career APIs (list + detail endpoints referenced in `har/moledao.io_api_career_list.har`, `moledao.io_api_career_details1.har` and `har/moledao.io_api_career_details2.har`).
- Python package index for `requests`, `beautifulsoup4`, `python-docx`, and testing tools (`pytest`).
- Local filesystem write access for `/output` (or configured path) where DOCX bundles are saved.
