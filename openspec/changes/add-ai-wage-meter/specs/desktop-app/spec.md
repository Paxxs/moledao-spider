## ADDED Requirements

### Requirement: AI Wage Meter
The main screen MUST show a playful "AI wage" indicator that estimates GPT-4 pricing for the text processed during scraping.

#### Scenario: GPT-4 wage pulses during scraping
- **GIVEN** the scraper normalizes each job detail payload
- **THEN** it SHALL accumulate the approximate word count of every detail JSON (sanitized text is acceptable) and attach `wordCount` plus `aiCostUsd` fields to every `scrape:progress` event
- **AND** the calculation SHALL assume the most expensive ChatGPT/GPT-4 tier pricing (>= $0.06 per 1K tokens) and convert the accumulated words to USD with at least two decimals
- **AND** the renderer SHALL display a localized card that shows the running word count and GPT-4 wage in USD next to other progress stats
- **AND** whenever the wage increases the card animates/pulses (brief scale or bounce) before resetting to the base font size so the growth feels lively without breaking layout
- **AND** the idle/completed states keep the card visible with zeroed values so users understand the metric even outside of active scrapes
