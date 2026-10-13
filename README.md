# Virtual Screening Pharmacophore

A Python demonstration of **rule-based task evaluation**, with an in-memory HMAC-SHA256 audit log, command-line and REST interfaces, and a standalone browser demo.

**Scientific scope:** Despite the repository name, the current implementation does **not** build 3D pharmacophores, process molecular structures, perform conformer alignment, or screen chemical libraries. The thresholds and status keywords are illustrative rules, **not** validated clinical or pharmacological decision criteria.

## Features

- Root system (`agents/` and `cli.py`): three rule-based workers (primary metric >25, secondary metric >12, descriptor keyword flags) with optional critical escalation, HMAC-signed in-memory audit entries and a pattern-based identifier guard.
- Separate `pharmaco_screen/` CLI and API: demonstration threshold evaluator (primary >25 and secondary >10) returning alerts. It is not a molecular screening algorithm.
- `enrichment.py`: five generic threshold evaluators; their names do not imply operational visualization, docking or fragment-screening capabilities.
- `web/`: responsive static browser evaluator matching the root worker thresholds. Evaluation and JSON export run locally, without a server or cryptographic signing.

## Browser demonstration

Open `web/index.html` locally, or serve the `web/` directory with a static HTTP server. Enter identifiers, numerical metrics, a status descriptor, and optionally a critical flag. The output is a JSON rule-evaluation result. The browser UI does **not** call the backend or generate audit hashes.

GitHub Pages deployment is configured in `.github/workflows/pages.yml`; a public live URL should be used only once Pages is enabled and the deployment is verified.

## Install

Requires Python 3.9 or later.

```bash
git clone https://github.com/abusuraihsakhri/virtual-screening-pharmacophore.git
cd virtual-screening-pharmacophore
python -m pip install -e ".[web,test]"
export AUDIT_SECRET_KEY="$(python -c 'import secrets; print(secrets.token_hex(32))')"
```

On Windows PowerShell, set `$env:AUDIT_SECRET_KEY` to a securely generated random value. Do not commit secrets or reuse the former example key.

## Command-line usage

The root `cli.py` uses `agents/` and requires `AUDIT_SECRET_KEY` for audit operations:

```bash
python cli.py audit --task-id TASK-01 --target SAMPLE-01 --primary 29.4 --secondary 14.8
python cli.py batch -i sample.csv -o results.csv
python cli.py chat "system status"
python cli.py verify-audit
python cli.py serve --host 127.0.0.1 --port 8000
```

The installed console script instead invokes the **separate** `pharmaco_screen/` workflow:

```bash
virtual-screening-pharmacophore audit --task-id T1 --primary 20 --secondary 8
virtual-screening-pharmacophore batch -i sample.csv -o results.csv
```

The two interfaces currently use different secondary thresholds and result schemas. Avoid comparing their outputs as if they were interchangeable.

CSV files use `task_id,target_identifier,primary_metric,secondary_metric,is_critical_flag,status_descriptor` (see `sample.csv`). Invalid numerical rows are skipped by the batch command.

## REST API

Start the root server with `python cli.py serve`; its OpenAPI schema is available at `/docs` and it exposes `GET /health`, `GET /metrics`, `POST /api/audit`, `POST /api/chat`, and `GET /api/audit/logs`.

The `pharmaco_screen.server.create_app()` factory provides a separate service with `/health`, `/api/audit`, and `/api/chat` when launched through its CLI.

**Security boundary:** The root API has no authentication or rate limiting; bind it to a trusted local interface or place it behind appropriate controls. Audit records are kept **only in process memory**, so they disappear on restart. The identifier guard uses known regular-expression patterns and is **not** comprehensive PHI detection, de-identification, or a compliance guarantee. Never supply actual patient data. The `mock` chat implementation does not perform scientific validation.

## Docker

```bash
export AUDIT_SECRET_KEY="$(python -c 'import secrets; print(secrets.token_hex(32))')"
docker compose up --build
```

Compose requires the key to be supplied by the environment and binds the HTTP port to `127.0.0.1:8000` on the host. For deployments outside a trusted development machine, add authentication, transport security, appropriate access control, and durable logging.

## Tests

```bash
python -m pytest -q
node --check web/app.js
node tests/test_web.cjs
```

GitHub Actions tests supported Python versions and checks the standalone browser rules. A local CI key is generated per job. No external molecular or machine-learning libraries are used; the browser demonstration requires a modern JavaScript-capable browser.

## Project layout

- `agents/`: Pydantic schemas, rule evaluators, coordinator, HMAC ledger and FastAPI routes
- `pharmaco_screen/`: independent rule evaluator, CLI and REST server
- `enrichment.py`: generic threshold wrappers
- `web/`: static HTML and client-side JavaScript
- `tests/`: Python and JavaScript regression tests
- `Dockerfile`, `docker-compose.yml`, `.github/workflows/`: runtime and CI configuration

## License

MIT — see [LICENSE](LICENSE).
