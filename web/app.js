"use strict";

// These demonstrative thresholds mirror agents/workers.py; no backend is contacted.
function evaluateMetrics(input) {
  const alerts = [];
  if (input.primary_metric > 25) {
    alerts.push({origin_worker: "InvariantQCWorker", urgency: "ELEVATED_RISK",
      summary: "Primary Metric Threshold Exceeded",
      technical_details: "Primary metric exceeds the configured demonstration threshold (25.00)."});
  }
  if (input.is_critical_flag || input.secondary_metric > 12) {
    alerts.push({origin_worker: "SafetyEscalationWorker",
      urgency: input.is_critical_flag ? "CRITICAL_STAT_PANIC" : "ELEVATED_RISK",
      summary: "Safety Condition Triggered",
      technical_details: "Critical flag or secondary metric threshold (>12.00) triggered."});
  }
  const descriptor = input.status_descriptor.toUpperCase();
  if (["DISCORDANT", "ANOMALY", "MUTANT", "VIOLATION", "FAIL", "REJECT"].some(flag => descriptor.includes(flag))) {
    alerts.push({origin_worker: "ProtocolConformanceWorker", urgency: "ELEVATED_RISK",
      summary: "Descriptor Flag Identified",
      technical_details: "Input descriptor contains a configured flag keyword."});
  }
  const critical = alerts.filter(alert => alert.urgency === "CRITICAL_STAT_PANIC").length;
  const urgency = critical ? "CRITICAL_STAT_PANIC" : alerts.length ? "ELEVATED_RISK" : "ROUTINE";
  return {
    mode: "Local rule-based demonstration (not pharmacophore screening)",
    task_id: input.task_id, target_identifier: input.target_identifier,
    overall_urgency: urgency,
    integrity_status: critical ? "RECALIBRATION_REQUIRED" : alerts.length ? "DISCORDANT_ANOMALY" : "VALIDATED_OPTIMAL",
    total_alerts: alerts.length, critical_alerts_count: critical, alerts: alerts,
    audit_hash: null
  };
}

(function () {
  const form = document.getElementById("audit-form");
  const output = document.getElementById("result");
  const counter = document.getElementById("task-count");
  const status = document.getElementById("result-status");
  const download = document.getElementById("download");
  let lastResult = null;
  let count = 0;

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const primaryText = document.getElementById("primary_metric").value.trim();
    const secondaryText = document.getElementById("secondary_metric").value.trim();
    const primary = Number(primaryText), secondary = Number(secondaryText);
    if (!primaryText || !secondaryText || !Number.isFinite(primary) || !Number.isFinite(secondary)) {
      output.textContent = "Enter finite primary and secondary numbers.";
      status.textContent = "Input error";
      return;
    }
    const input = {
      task_id: document.getElementById("task_id").value.trim(),
      target_identifier: document.getElementById("target_id").value.trim(),
      primary_metric: primary, secondary_metric: secondary,
      status_descriptor: document.getElementById("status_descriptor").value.trim(),
      is_critical_flag: document.getElementById("is_critical").checked
    };
    if (!input.task_id || !input.target_identifier) {
      output.textContent = "Provide a task identifier and target identifier.";
      status.textContent = "Input error";
      return;
    }
    lastResult = evaluateMetrics(input);
    output.textContent = JSON.stringify(lastResult, null, 2);
    status.textContent = lastResult.overall_urgency.replaceAll("_", " ");
    status.dataset.urgency = lastResult.overall_urgency;
    counter.textContent = String(++count);
    download.disabled = false;
  });

  download.addEventListener("click", function () {
    if (!lastResult) return;
    const blob = new Blob([JSON.stringify(lastResult, null, 2) + "\n"], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "evaluation-result.json";
    anchor.click();
    URL.revokeObjectURL(url);
  });
})();
