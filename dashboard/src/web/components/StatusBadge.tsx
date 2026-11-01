const STATUS_LABELS: Record<string, string> = {
  running: "Läuft",
  stopped: "Gestoppt",
  installing: "Installiert…",
  provisioning: "Wird eingerichtet…",
  restarting: "Startet neu…",
  error: "Fehler",
};

const STATUS_CLASSES: Record<string, string> = {
  running: "status-ok",
  stopped: "status-off",
  installing: "status-pending",
  provisioning: "status-pending",
  restarting: "status-pending",
  error: "status-error",
};

export function StatusBadge({ status }: { status: string }) {
  const className = STATUS_CLASSES[status] ?? "status-pending";
  const label = STATUS_LABELS[status] ?? status;
  return <span className={`status-badge ${className}`}>{label}</span>;
}
