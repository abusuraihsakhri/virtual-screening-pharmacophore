# Virtual Screening Pharmacophore

> **Domain:** Clinical Decision Support & Biomedical Computing / Computational Chemistry & AI Drug Discovery

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![Python](https://img.shields.io/badge/Python-3.10%20%7C%203.11%20%7C%203.12-3776AB.svg?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688.svg?logo=fastapi&logoColor=white)
![Audit Trail](https://img.shields.io/badge/Audit-HMAC--SHA256_Tamper--Evident-brightgreen.svg)
![Zero-PHI Guard](https://img.shields.io/badge/Guard-Zero--PHI_Outbound-blue.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg?logo=docker&logoColor=white)

</div>

---

## Overview

**Virtual Screening Pharmacophore** is a dual-domain analytical platform combining clinical decision support with 3D pharmacophore feature alignment and candidate library screening. The system provides:

- **Clinical & Biomedical AI** (`agents/`): Multi-worker evaluation with HMAC-SHA256 tamper-evident audit trails and Zero-PHI outbound protection.
- **PharmacoScreen Engine** (`pharmaco_screen/`): 3D pharmacophore feature alignment and database screening agent following IUPAC Pharmacophore Modeling Guidelines.
- **Enrichment Suite** (`enrichment.py`): Modular engines for visualization, implementation, dependencies, testing, and fragment-based drug design workflows.

---

## Quick Start

### Prerequisites

- Python 3.9+
- pip

### Installation

```bash
# Clone the repository
git clone https://github.com/abusuraihsakhri/virtual-screening-pharmacophore.git
cd virtual-screening-pharmacophore

# Install in development mode
pip install -e .

# Or install with optional web server dependencies
pip install -e ".[web]"
```

### Environment Configuration

The audit trail requires a secret key to be set:

```bash
# Generate a secure key
export AUDIT_SECRET_KEY=$(python -c "import secrets; print(secrets.token_hex(32))")
```

---

## Usage

### CLI Commands

The package provides a unified CLI via `cli.py`:

```bash
# Run a single audit evaluation
python cli.py audit --task-id TASK-01 --target KEY-01 --primary 28.5 --secondary 14.2

# Query the supervisory chat
python cli.py chat "What is the system status?"

# Batch process a CSV file
python cli.py batch -i sample.csv -o results.csv

# Verify audit trail integrity
python cli.py verify-audit

# Launch the FastAPI REST server
python cli.py serve --host 127.0.0.1 --port 8000
```

### CSV Batch Format

The batch command accepts CSV files with columns:

| Column | Type | Description |
|:-------|:-----|:------------|
| `task_id` | string | Unique task identifier |
| `target_identifier` | string | Target entity or key |
| `primary_metric` | float | Primary measurement value |
| `secondary_metric` | float | Secondary measurement value |
| `status_descriptor` | string | Status code (NOMINAL, DISCORDANT_ANOMALY, etc.) |
| `is_critical_flag` | boolean | Critical escalation flag |

Rows with invalid data are skipped with a warning.

### REST API

When running the server, the following endpoints are available:

| Endpoint | Method | Description |
|:---------|:-------|:------------|
| `/health` | GET | Service health check |
| `/metrics` | GET | Operational metrics |
| `/api/audit` | POST | Submit a task for evaluation |
| `/api/chat` | POST | Query the supervisor |
| `/api/audit/logs` | GET | Retrieve audit trail |

### Simulation

Run high-throughput simulation benchmarks:

```bash
python simulator.py 1000
```

---

## Security

- **Zero-PHI Outbound Guard:** AST and regex inspection blocking SSNs, MRNs, phone numbers, emails, and patient identifiers from leaving the system.
- **HMAC-SHA256 Audit Trail:** Chained, cryptographically signed logs for every evaluation and state transition. Requires `AUDIT_SECRET_KEY` environment variable.
- **PHI Redaction:** Automatic redaction of detected PHI patterns in outbound data.

---

## Testing

```bash
# Run the full test suite
pytest -v

# Run with coverage
pytest -v --cov=agents --cov=pharmaco_screen --cov=enrichment
```

Tests cover:
- PHI guard enforcement
- Specialized worker evaluations
- Supervisor consensus and audit integrity
- CLI command execution
- Enrichment engine threshold escalation

---

## Container Deployment

```bash
docker build -t virtual-screening-pharmacophore .
docker run -e AUDIT_SECRET_KEY=<your-secret-key> -p 8000:8000 virtual-screening-pharmacophore
```

Or with Docker Compose:

```bash
AUDIT_SECRET_KEY=<your-secret-key> docker-compose up
```

---

## Project Structure

```
virtual-screening-pharmacophore/
├── agents/                    # Clinical & Biomedical AI agent system
│   ├── __init__.py
│   ├── api.py                 # FastAPI REST server
│   ├── base.py                # Security, PHI guard, audit trail
│   ├── learning.py            # Bayesian calibration engine
│   ├── llm_factory.py         # LLM provider factory
│   ├── metrics.py             # Prometheus metrics collector
│   ├── models.py              # Pydantic data models
│   ├── streamer.py            # WebSocket telemetry broadcaster
│   ├── supervisor.py          # Master orchestrator
│   └── workers.py             # Specialized evaluation workers
├── pharmaco_screen/           # 3D Pharmacophore screening engine
│   ├── __init__.py
│   ├── agents.py              # Sub-agents and coordinator
│   ├── cli.py                 # CLI entry point
│   ├── engine.py              # Core algorithmic engine
│   ├── models.py              # Data models
│   └── server.py              # FastAPI server factory
├── tests/                     # Pytest test suite
├── cli.py                     # Root CLI entry point
├── enrichment.py              # Enrichment feature engines
├── simulator.py               # High-throughput simulation
├── pyproject.toml             # Project configuration
├── Dockerfile                 # Container build
└── docker-compose.yml         # Container orchestration
```

---

## License

MIT License - see [LICENSE](LICENSE) for details.
