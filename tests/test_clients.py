from __future__ import annotations

from pathlib import Path

from moledao_spider.clients import HarCareerDetailsClient, HarCareerListClient


def test_har_clients_load_list_and_details() -> None:
    base = Path("har")
    list_client = HarCareerListClient(base / "moledao.io_api_career_list.har")
    list_payload = list_client.fetch()
    assert list_payload, "List payload should not be empty"

    details_client = HarCareerDetailsClient(
        [
            base / "moledao.io_api_career_details1.har",
            base / "moledao.io_api_career_details2.har",
        ]
    )
    detail = details_client.fetch(list_payload[0]["id"])
    assert detail["id"] == list_payload[0]["id"]
