"""Logging helpers for the CLI."""

from __future__ import annotations

import logging
import sys
from typing import Literal

from rich.logging import RichHandler


def configure_logging(verbose: bool = False) -> None:
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format="%(message)s",
        datefmt="[%X]",
        handlers=[RichHandler(console=None, rich_tracebacks=True, markup=False)],
        force=True,
    )
    logging.getLogger("urllib3").setLevel(logging.WARNING)
