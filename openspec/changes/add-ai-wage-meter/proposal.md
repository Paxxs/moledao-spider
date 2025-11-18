## Why
- Recruiters asked for a playful "AI wage" indicator that shows how much an expensive ChatGPT model would charge for the text being scraped so they can justify AI usage.
- The current main screen lacks any metric beyond processed job counts, so there is no tangible feedback that the pipeline is manipulating lots of copy.
- We already have normalized detail payloads during scraping, which makes it easy to approximate word counts and stream them back to the renderer in real time.

## What Changes
- Extend the scraper progress payload with aggregated word counts derived from each job's detail JSON plus a GPT-4 tier price calculation so the renderer knows the running "AI wage".
- Surface a new card on the main screen (next to the log stats) that displays localized labels for word count and the GPT-4 cost, animating/bouncing whenever the wage increases.
- Internationalize the new copy across English, Simplified Chinese, and Traditional Chinese while keeping the animation subtle enough to match the Siri-style aesthetic.

## Impact
- Introduces extra data on the IPC `scrape:progress` channel and a small amount of math in the scraper loop; DOCX export behavior stays the same.
- Requires UI + localization updates and a lightweight animation hook in React to pulse the wage amount when new data arrives.
- No new external dependencies beyond possible CSS keyframes/utility classes, but we must regression-test scraping to ensure the additional payload does not break running jobs.
