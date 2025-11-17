"""Domain models and mapping helpers for career data."""

from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Any, Dict, Iterable, Mapping, Sequence

COUNTRY_NAMES = {
    "CN": "China",
    "SG": "Singapore",
    "US": "United States",
    "GB": "United Kingdom",
    "UK": "United Kingdom",
    "ID": "Indonesia",
    "KR": "South Korea",
    "JP": "Japan",
    "DE": "Germany",
    "AU": "Australia",
    "FR": "France",
    "AE": "United Arab Emirates",
}

PREFERENCE_LOOKUP = {
    1: "Fully Remote",
    2: "Hybrid",
    3: "Temporary Remote",
    4: "Office Only",
}

TYPE_LOOKUP = {
    1: "Full-time",
    2: "Internship",
    3: "Part-time",
    4: "Freelancer",
    5: "Student",
}

EXPERIENCE_LOOKUP = {
    1: "No Experience",
    2: "Fresh Graduate/Student",
    3: "<1 Yr Exp",
    4: "1-3 Yrs Exp",
    5: "3-5 Yrs Exp",
    6: "5-10 Yrs Exp",
    7: ">10 Yrs Exp",
}


def lookup(mapping: Mapping[int, str], code: int | None, default: str = "Unknown") -> str:
    if code is None:
        return default
    return mapping.get(int(code), default)


def parse_location(base_value: str | None) -> str:
    """Convert the `career.base` JSON blob into a readable country name."""
    if not base_value:
        return "Unknown"
    country_code = None
    try:
        base_data = json.loads(base_value)
    except json.JSONDecodeError:
        return base_value

    if isinstance(base_data, list):
        for entry in base_data:
            value = entry.get("value") if isinstance(entry, dict) else None
            country_code = (value or {}).get("country")
            if country_code:
                break
    elif isinstance(base_data, dict):
        country_code = (base_data.get("value") or {}).get("country")

    if not country_code:
        return "Unknown"

    country_code = str(country_code).upper()
    return COUNTRY_NAMES.get(country_code, country_code)


def format_relative_time(update_date: str, now: datetime | None = None) -> str:
    """Return a relative time string like '13 hours ago'."""
    if not update_date:
        return "unknown"

    now = now or datetime.now(tz=UTC)
    normalized = update_date.replace("Z", "+00:00")
    try:
        updated_dt = datetime.fromisoformat(normalized)
    except ValueError:
        return update_date

    diff = now - updated_dt
    seconds = diff.total_seconds()
    if seconds < 0:
        seconds = abs(seconds)
        if seconds < 3600:
            return f"in {int(seconds // 60) or 1} minutes"
        if seconds < 86400:
            hours = int(seconds // 3600) or 1
            return f"in {hours} hours"
        days = int(seconds // 86400) or 1
        return f"in {days} days"

    if seconds < 60:
        return "just now"
    if seconds < 3600:
        minutes = int(seconds // 60)
        return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
    if seconds < 86400:
        hours = int(seconds // 3600)
        return f"{hours} hour{'s' if hours != 1 else ''} ago"
    if seconds < 86400 * 30:
        days = int(seconds // 86400)
        return f"{days} day{'s' if days != 1 else ''} ago"
    return updated_dt.strftime("%Y-%m-%d")


def extract_tags(detail_payload: Mapping[str, Any]) -> str:
    tags = detail_payload.get("tags") or []
    names: list[str] = []
    for tag in tags:
        name = tag.get("name") if isinstance(tag, dict) else None
        if name:
            names.append(str(name))
    return ", ".join(names) if names else "N/A"


def extract_content(detail_payload: Mapping[str, Any]) -> str:
    content_block = detail_payload.get("content") or {}
    html_content = content_block.get("content") if isinstance(content_block, dict) else None
    return html_content or ""


def _career_field(source: Mapping[str, Any], key: str, fallback: Any = None) -> Any:
    career_section = source.get("career") or {}
    return career_section.get(key, fallback)


@dataclass(slots=True)
class CareerRecord:
    job_id: str
    company: str
    role: str
    type_text: str
    preference_text: str
    experience_text: str
    location: str
    relative_time: str
    update_date: str
    tag_text: str
    html_content: str

    def log_stub(self) -> str:
        return f"[{self.company}][{self.role}]-[{self.preference_text}]"


def build_career_record(summary: Mapping[str, Any], detail: Mapping[str, Any]) -> CareerRecord:
    job_id = str(summary.get("id") or detail.get("id"))
    company = (
        summary.get("belonging", {}).get("name")
        or detail.get("belonging", {}).get("name")
        or "Unknown Company"
    )
    role = str(summary.get("name") or detail.get("name") or "Unknown Role")

    pref_code = _career_field(summary, "preferences")
    type_code = _career_field(summary, "type")
    exp_code = _career_field(detail, "experience") or _career_field(summary, "experience")

    preference_text = lookup(PREFERENCE_LOOKUP, pref_code)
    type_text = lookup(TYPE_LOOKUP, type_code)
    experience_text = lookup(EXPERIENCE_LOOKUP, exp_code)

    base_blob = _career_field(summary, "base") or _career_field(detail, "base")
    location = parse_location(base_blob)

    update_date = str(detail.get("updateDate") or summary.get("updateDate") or "")
    relative_time = format_relative_time(update_date)

    tag_text = extract_tags(detail)
    html_content = extract_content(detail)

    return CareerRecord(
        job_id=job_id,
        company=company,
        role=role,
        type_text=type_text,
        preference_text=preference_text,
        experience_text=experience_text,
        location=location,
        relative_time=relative_time,
        update_date=update_date,
        tag_text=tag_text,
        html_content=html_content,
    )
