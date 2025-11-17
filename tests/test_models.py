from __future__ import annotations

from datetime import UTC, datetime, timedelta
from pathlib import Path

from moledao_spider.models import (
    CareerRecord,
    build_career_record,
    format_relative_time,
    parse_location,
)

from tests.utils import load_har_payload


def test_build_career_record_from_har_snapshot(monkeypatch) -> None:
    summary_payload = load_har_payload(Path("har/moledao.io_api_career_list.har"))
    detail_payload = load_har_payload(Path("har/moledao.io_api_career_details1.har"))

    summary = summary_payload["data"]["list"][0]
    detail = detail_payload["data"]

    monkeypatch.setattr(
        "moledao_spider.models.format_relative_time", lambda _update: "13 hours ago"
    )

    record = build_career_record(summary, detail)
    assert record.company == "GREENWICH OASIS CAPITAL"
    assert record.preference_text == "Fully Remote"
    assert record.type_text == "Freelancer"
    assert record.location == "China"
    assert record.tag_text == "Operations"
    assert record.relative_time == "13 hours ago"
    assert record.html_content.startswith("<p")


def test_parse_location_handles_custom_json() -> None:
    assert parse_location('[{"value":{"city":"Shanghai","country":"CN"}}]') == "China"
    assert parse_location(None) == "Unknown"
    assert parse_location("plain text") == "plain text"


def test_format_relative_time_outputs_expected_strings() -> None:
    now = datetime(2024, 1, 2, tzinfo=UTC)
    assert format_relative_time("2024-01-01T00:00:00+00:00", now=now) == "1 day ago"
    assert format_relative_time("2024-01-02T00:00:00+00:00", now=now) == "just now"
    future = now + timedelta(hours=5)
    assert format_relative_time(future.isoformat(), now=now) == "in 5 hours"
