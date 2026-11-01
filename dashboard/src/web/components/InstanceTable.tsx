import { useCallback, useEffect, useState } from "react";
import { listInstances, type InstanceDto } from "../api/client.js";
import { InstanceRow } from "./InstanceRow.js";

const POLL_INTERVAL_MS = 20_000;

export function InstanceTable() {
  const [instances, setInstances] = useState<InstanceDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setInstances(await listInstances());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  useEffect(() => {
    void refresh();
    const interval = setInterval(() => void refresh(), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  return (
    <div className="instance-table-container">
      <div className="panel-header">
        <h2>Server</h2>
        <button className="btn-secondary" onClick={() => void refresh()}>
          Aktualisieren
        </button>
      </div>
      {error && <div className="error-text">{error}</div>}
      <table className="instance-table">
        <thead>
          <tr>
            <th>Server</th>
            <th>Standardbenutzer</th>
            <th>Hostsystem</th>
            <th>Status</th>
            <th>Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {(instances ?? []).map((instance) => (
            <InstanceRow key={instance.id} instance={instance} onChanged={refresh} />
          ))}
        </tbody>
      </table>
      {instances && instances.length === 0 && (
        <div className="empty-state">Keine Instanzen gefunden.</div>
      )}
      {instances === null && !error && <div className="empty-state">Lade…</div>}
    </div>
  );
}
