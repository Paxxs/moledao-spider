## ADDED Requirements
### Requirement: Career data ingestion
The system SHALL ingest the moledao.io career list and detail payloads by replaying the provided HAR fixtures or hitting the live APIs with polite rate limiting and retry support.

#### Scenario: Replay HAR job list
- **GIVEN** the CLI runs without the `--live` flag
- **WHEN** the pipeline starts
- **THEN** it SHALL parse `har/moledao.io_api_career_list.har` and queue every listed career id for detail fetching

#### Scenario: Fetch live job details
- **GIVEN** the CLI runs with `--live`
- **WHEN** the pipeline fetches detail data
- **THEN** it SHALL call the documented detail endpoint for each id with retry/backoff and log failures without terminating the run

### Requirement: Career normalization
The system SHALL normalize every job into a typed domain object with mapped preference/type/experience text, country-only locations, and timestamp metadata.

#### Scenario: Map lookup tables
- **WHEN** a job is normalized
- **THEN** `career.preferences`, `career.type`, and `career.experience` SHALL map using the provided lookup tables so the display text matches the spec

#### Scenario: Location and timestamps
- **WHEN** the source payload contains a location or `updateDate`
- **THEN** the normalized record SHALL keep only the country name and preserve `updateDate` plus the relative “13 hours ago” style string when available

### Requirement: Word formatting and batching
The system SHALL emit numbered DOCX files where each document contains at most 10 jobs formatted with the specified headings and metadata block.

#### Scenario: Ten jobs per file
- **WHEN** more than ten jobs are exported
- **THEN** the exporter SHALL start a new file after job ten, name files `jobs-001.docx`, `jobs-002.docx`, …, and include any leftover jobs in a final partial file

#### Scenario: Job layout
- **WHEN** a job is written to the document
- **THEN** it SHALL render the company as an H1 heading and “Role (Type)” as an H2 heading followed by the metadata lines (Location, Type, Preferences, postedAt, Exp, Tag, content, time) exactly in that order

### Requirement: Logging and CLI controls
The system SHALL expose a CLI that selects output folders, toggles live mode, and controls verbosity while logging every processed job.

#### Scenario: Structured log lines
- **WHEN** a job finishes processing
- **THEN** the logger SHALL emit `[Company][Role]-[Preference]` at INFO level so operators can audit the run

#### Scenario: CLI overrides
- **WHEN** the CLI receives arguments for output directory, batch size, or verbosity
- **THEN** the exporter SHALL honor the overrides without needing configuration changes in code

### Requirement: HTML sanitization and encoding
The system SHALL sanitize `career.content` HTML before inserting it into DOCX so bilingual text renders without unsafe markup.

#### Scenario: Strip unsafe tags
- **WHEN** the HTML snippet includes scripts or inline styles
- **THEN** the sanitizer SHALL remove unsafe elements and preserve the textual content before writing to the document in UTF-8
