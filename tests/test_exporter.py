from __future__ import annotations

from pathlib import Path

from docx import Document

from moledao_spider.exporter import DocxExporter
from moledao_spider.models import CareerRecord


def _sample_record() -> CareerRecord:
    return CareerRecord(
        job_id="job-1",
        company="Test Co",
        role="Engineer",
        type_text="Full-time",
        preference_text="Office Only",
        experience_text="1-3 Yrs Exp",
        location="China",
        relative_time="3 hours ago",
        update_date="2024-01-01T00:00:00Z",
        tag_text="Engineering",
        html_content="<p>Hello</p><script>alert(1)</script><p>World</p>",
    )


def test_docx_exporter_writes_heading_and_content(tmp_path: Path) -> None:
    exporter = DocxExporter(output_dir=tmp_path, batch_size=10)
    files = exporter.export([_sample_record()])
    assert len(files) == 1
    doc = Document(files[0])
    texts = [p.text for p in doc.paragraphs if p.text]
    assert "Test Co" in texts[0]
    assert any("Hello" in text for text in texts)
    assert not any("alert(1)" in text for text in texts)
