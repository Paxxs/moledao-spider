# Moledao Spider

CLI utility that replays moledao.io career HAR captures (or live APIs) and exports sequential DOCX files containing batches of ten job postings.

## Getting Started

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e .[dev]
```

## Usage

```bash
# HAR replay (default)
moledao-spider --output-dir ./output

# Live API scrape with verbose logs
moledao-spider --live --verbose --output-dir ./output-live
```

Key options:

- `--batch-size` – jobs per DOCX (default 10).
- `--append` – keep numbering after existing files instead of overwriting.
- `--list-har` / `--detail-har` – point at alternative HAR captures.
- `--live` – perform live HTTP calls with retry/backoff.

Each job entry renders:

```
<COMPANY>                     # H1
<ROLE> (<Type>)               # H2
Location: <Country>
Type: <friendly type>
Preferences: <friendly preference>
<Relative time text>
Exp: <experience text>
Tag: <comma separated tags>
content:
<HTML converted paragraphs>
time: <updateDate>
```
