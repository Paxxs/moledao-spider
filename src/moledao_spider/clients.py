"""HTTP and HAR-backed clients for the Moledao career APIs."""

from __future__ import annotations

import base64
import json
import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, MutableMapping, Protocol, Sequence

import requests
from requests import Response, Session
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

logger = logging.getLogger(__name__)

DEFAULT_BASE_URL = "https://api.moledao.io/api"


class CareerListClient(Protocol):
    """Fetches the list of careers."""

    def fetch(self) -> List[dict]:
        """Return the raw list payload."""


class CareerDetailsClient(Protocol):
    """Fetches an individual career detail payload."""

    def fetch(self, job_id: str) -> dict:
        """Return the detail payload for ``job_id``."""


def _load_har_entries(path: Path) -> List[dict]:
    if not path.exists():
        raise FileNotFoundError(f"HAR file not found: {path}")
    data = json.loads(path.read_text())
    return data.get("log", {}).get("entries", [])


def _extract_entry_json(entry: dict) -> dict | None:
    content = entry.get("response", {}).get("content", {})
    text = content.get("text")
    if not text:
        return None

    if content.get("encoding") == "base64":
        text_bytes = base64.b64decode(text)
        text = text_bytes.decode("utf-8")

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        logger.debug("Skipping non-JSON HAR entry")
        return None


@dataclass
class HarCareerListClient:
    """Reads the career list from a captured HAR file."""

    har_path: Path

    def fetch(self) -> List[dict]:
        for entry in _load_har_entries(self.har_path):
            payload = _extract_entry_json(entry)
            if not payload:
                continue
            data = payload.get("data") or {}
            list_data = data.get("list")
            if list_data:
                logger.debug("Loaded %s jobs from %s", len(list_data), self.har_path)
                return list_data

        raise RuntimeError(f"No list payload found in HAR {self.har_path}")


@dataclass
class HarCareerDetailsClient:
    """Reads career details from one or more HAR files."""

    har_paths: Sequence[Path]

    def __post_init__(self) -> None:
        self._cache: Dict[str, dict] = {}
        for path in self.har_paths:
            for entry in _load_har_entries(path):
                payload = _extract_entry_json(entry)
                if not payload:
                    continue
                job = payload.get("data")
                job_id = (job or {}).get("id")
                if job_id:
                    self._cache[job_id] = job
        logger.debug(
            "Indexed %s job details from %s HAR files", len(self._cache), len(self.har_paths)
        )

    def fetch(self, job_id: str) -> dict:
        job = self._cache.get(job_id)
        if not job:
            raise KeyError(f"Job id {job_id} not found in HAR cache")
        return job


def _ensure_session(session: Session | None) -> Session:
    return session or requests.Session()


def _handle_response(response: Response) -> dict:
    response.raise_for_status()
    payload = response.json()
    if payload.get("code") != 200:
        raise RuntimeError(f"Unexpected API response: {payload}")
    data = payload.get("data")
    if data is None:
        raise RuntimeError("API response missing data field")
    return data


@dataclass
class LiveCareerListClient:
    """Hits the live career list endpoint with retries."""

    base_url: str = DEFAULT_BASE_URL
    session: Session | None = None

    def __post_init__(self) -> None:
        self.session = _ensure_session(self.session)

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=4),
        retry=retry_if_exception_type((requests.RequestException, RuntimeError)),
        reraise=True,
    )
    def fetch(self) -> List[dict]:
        params = {
            "id": "",
            "current": 1,
            "pageSize": 300,
            "tags": "",
            "sortStr": "event.updateDate:DESC",
            "name": "",
            "location": "",
            "role": "",
            "workType": "",
            "like": 2,
            "applied": 2,
            "workLanguage": "",
            "workExperience": "",
            "workPreferences": "",
            "status": "",
            "approve": 1,
        }
        url = f"{self.base_url}/career/list"
        logger.debug("Requesting career list from %s", url)
        resp = self.session.get(url, params=params, timeout=15)
        data = _handle_response(resp)
        list_data = data.get("list") or []
        logger.info("Fetched %s jobs from live list API", len(list_data))
        return list_data


@dataclass
class LiveCareerDetailsClient:
    """Hits the live career detail endpoint with retries."""

    base_url: str = DEFAULT_BASE_URL
    session: Session | None = None

    def __post_init__(self) -> None:
        self.session = _ensure_session(self.session)

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=4),
        retry=retry_if_exception_type((requests.RequestException, RuntimeError)),
        reraise=True,
    )
    def fetch(self, job_id: str) -> dict:
        url = f"{self.base_url}/career/details"
        resp = self.session.get(url, params={"id": job_id}, timeout=15)
        data = _handle_response(resp)
        logger.info("Fetched job details for %s", job_id)
        return data
