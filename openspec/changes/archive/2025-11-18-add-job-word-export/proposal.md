# Change: Add HAR-driven job exporter

## Why
Recruiting needs a reliable way to replay the moledao.io career APIs (or previously captured HAR flows) and turn the data into shareable Word packets. Today there is no automated path to convert the JSON payloads into the required H1/H2 layout, and logging is inconsistent, which makes audits painful.

## What Changes
- Build HAR/live HTTP clients that fetch the latest career list plus per-career details and normalize them into typed dataclasses.
- Implement a docx exporter that batches every 10 jobs into a numbered `jobs-XYZ.docx` bundle with the specified typography and metadata ordering.
- Provide CLI and logging plumbing so ops can pick output directories, switch between HAR vs live mode, and see `[Company][Role]-[Preference]` logs for every processed job.
- Sanitize HTML snippets from `career.content` before insertion so bilingual text renders safely in Word.

## Impact
- Affected specs: `job-exporter`
- Affected code: HTTP clients, domain models/mappers, docx exporter, CLI/logging layer
