"""Testing helpers for loading HAR fixtures."""

from __future__ import annotations

import base64
import json
from pathlib import Path
from typing import Any, Mapping


def load_har_payload(path: Path) -> Mapping[str, Any]:
    data = json.loads(path.read_text())
    entries = data.get("log", {}).get("entries", [])
    if not entries:
        raise RuntimeError(f"No entries found in {path}")
    content = entries[0]["response"]["content"]
    text = content.get("text") or ""
    if content.get("encoding") == "base64":
        text = base64.b64decode(text).decode("utf-8")
    return json.loads(text)
