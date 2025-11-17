## 1. Implementation
- [ ] 1.1 Create HAR-backed and live HTTP clients that fetch the job list and detail records (with retries/logging)
- [ ] 1.2 Map API payloads into dataclasses with preference/type/experience lookup helpers and location normalization
- [ ] 1.3 Build DOCX exporter that batches every 10 jobs, sets heading hierarchy, and writes sequential filenames
- [ ] 1.4 Wire CLI/logging so users can choose output directories, enable verbose mode, and see `[Company][Role]-[Preference]` logs per job
- [ ] 1.5 Add unit/integration tests that cover mapping, batching, and HAR replay flows
