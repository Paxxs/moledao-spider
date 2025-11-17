from __future__ import annotations

from pathlib import Path

from click.testing import CliRunner

from moledao_spider.cli import main


def test_cli_generates_docx_from_har(tmp_path: Path) -> None:
    runner = CliRunner()
    result = runner.invoke(
        main,
        [
            "--output-dir",
            str(tmp_path),
            "--batch-size",
            "5",
            "--list-har",
            "har/moledao.io_api_career_list.har",
            "--detail-har",
            "har/moledao.io_api_career_details1.har",
            "--detail-har",
            "har/moledao.io_api_career_details2.har",
        ],
        catch_exceptions=False,
    )
    assert result.exit_code == 0
    assert (tmp_path / "jobs-001.docx").exists()
