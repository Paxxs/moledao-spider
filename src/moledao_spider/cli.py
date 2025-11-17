"""CLI entry point for the Moledao spider."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Iterable, Sequence

import click

from .clients import (
    CareerDetailsClient,
    CareerListClient,
    HarCareerDetailsClient,
    HarCareerListClient,
    LiveCareerDetailsClient,
    LiveCareerListClient,
)
from .exporter import DocxExporter
from .logging_utils import configure_logging
from .models import CareerRecord, build_career_record

logger = logging.getLogger(__name__)

DEFAULT_LIST_HAR = Path("har/moledao.io_api_career_list.har")
DEFAULT_DETAIL_HARS = (
    Path("har/moledao.io_api_career_details1.har"),
    Path("har/moledao.io_api_career_details2.har"),
)


@click.command()
@click.option(
    "--output-dir",
    type=click.Path(file_okay=False, dir_okay=True, path_type=Path),
    default=Path("./output"),
    show_default=True,
    help="Directory where DOCX files will be saved.",
)
@click.option("--batch-size", type=int, default=10, show_default=True, help="Jobs per DOCX file.")
@click.option(
    "--live/--har",
    default=False,
    show_default=True,
    help="Pull data from the live API instead of HAR fixtures.",
)
@click.option(
    "--list-har",
    type=click.Path(exists=True, dir_okay=False, path_type=Path),
    default=DEFAULT_LIST_HAR,
    show_default=True,
    help="HAR file used for the career list when not running with --live.",
)
@click.option(
    "--detail-har",
    type=click.Path(exists=True, dir_okay=False, path_type=Path),
    multiple=True,
    default=DEFAULT_DETAIL_HARS,
    show_default=True,
    help="HAR files used for career details when not running with --live.",
)
@click.option(
    "--append/--overwrite",
    default=False,
    help="Append numbering instead of overwriting existing DOCX files.",
)
@click.option("--verbose/--quiet", default=False, help="Enable verbose logging output.")
def main(
    output_dir: Path,
    batch_size: int,
    live: bool,
    list_har: Path,
    detail_har: Sequence[Path],
    append: bool,
    verbose: bool,
) -> None:
    """Entry point invoked by the console script."""
    configure_logging(verbose=verbose)

    list_client: CareerListClient
    detail_client: CareerDetailsClient

    if live:
        list_client = LiveCareerListClient()
        detail_client = LiveCareerDetailsClient()
        logger.info("Running in LIVE mode")
    else:
        detail_paths = detail_har or DEFAULT_DETAIL_HARS
        list_client = HarCareerListClient(list_har)
        detail_client = HarCareerDetailsClient(detail_paths)
        logger.info("Running in HAR mode with %s and %s", list_har, detail_paths)

    summaries = list_client.fetch()
    logger.info("Processing %s jobs", len(summaries))
    jobs: list[CareerRecord] = []
    for summary in summaries:
        job_id = summary.get("id")
        if not job_id:
            logger.warning("Skipping list entry without id: %s", summary)
            continue
        try:
            detail = detail_client.fetch(job_id)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Failed to fetch detail for %s: %s", job_id, exc)
            continue
        record = build_career_record(summary, detail)
        logger.info(record.log_stub())
        jobs.append(record)

    exporter = DocxExporter(output_dir=output_dir, batch_size=batch_size, append=append)
    written = exporter.export(jobs)
    logger.info("Generated %s document(s)", len(written))


if __name__ == "__main__":
    main()
