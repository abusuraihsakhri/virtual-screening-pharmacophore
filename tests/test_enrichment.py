"""
Automated Pytest for virtual-screening-pharmacophore Enrichment Modules.
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import pytest
from enrichment import (
    MolecularVisualizationEngine,
    ImplementationEngine,
    DependenciesEngine,
    TestingEngine,
    FragmentBasedDrugDesignEngine,
    VirtualScreeningPharmacophoreEnrichmentSuite,
    EnrichmentResult,
    enrichment_suite,
)

# Backwards-compatible aliases (kept for legacy callers)
from enrichment import (
    F_3dMolecularVisualizationWithPymolopenbabelIntegrationEngine,
    FragmentbasedDrugDesignFbddWorkflowEngine,
    VirtualscreeningpharmacophoreEnrichmentSuite,
)


def test_enrichment_suite_execution():
    suite = VirtualScreeningPharmacophoreEnrichmentSuite()
    res = suite.execute_all(primary_val=0.5, secondary_val=0.2)
    assert len(res) == 5
    for k, v in res.items():
        assert isinstance(v, EnrichmentResult)
        assert v.status in ["OPTIMAL", "WARNING", "CRITICAL_ALERT"]
        assert isinstance(v.recommendations, list)


def test_enrichment_threshold_escalation():
    suite = VirtualScreeningPharmacophoreEnrichmentSuite()
    res = suite.execute_all(primary_val=10.0, secondary_val=5.0)
    for k, v in res.items():
        assert v.status in ["WARNING", "CRITICAL_ALERT"]
        assert len(v.alerts) > 0


def test_individual_engines():
    """Each engine independently evaluates thresholds and records history."""
    engines = [
        MolecularVisualizationEngine,
        ImplementationEngine,
        DependenciesEngine,
        TestingEngine,
        FragmentBasedDrugDesignEngine,
    ]
    for cls in engines:
        eng = cls(threshold=1.0)
        # Below threshold -> OPTIMAL
        r1 = eng.evaluate(0.5)
        assert r1.status == "OPTIMAL"
        assert len(eng.history) == 1
        # Above threshold -> WARNING
        r2 = eng.evaluate(1.5)
        assert r2.status == "WARNING"
        # Above 2x threshold -> CRITICAL
        r3 = eng.evaluate(3.0)
        assert r3.status == "CRITICAL_ALERT"
        assert len(eng.history) == 3
