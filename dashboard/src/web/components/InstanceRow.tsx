import { useState } from "react";
import type { InstanceDto } from "../api/client.js";
import { ConfirmationRequiredError, performAction } from "../api/client.js";
import { StatusBadge } from "./StatusBadge.js";
import { ActionButton } from "./ActionButton.js";
import { ConfirmModal } from "./ConfirmModal.js";

const DESTRUCTIVE_ACTIONS = new Set(["stop", "restart", "shutdown"]);

type Action = "start" | "stop" | "restart" | "shutdown";

export function InstanceRow({
  instance,
  onChanged,
}: {
  instance: InstanceDto;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState<Action | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(action: Action, confirmed: boolean) {
    setBusy(true);
    setError(null);
    try {
      await performAction(instance.id, action, confirmed);
      onChanged();
    } catch (err) {
      if (err instanceof ConfirmationRequiredError) {
        setConfirming(action);
      } else {
        setError(err instanceof Error ? err.message : String(err));
      }
    } finally {
      setBusy(false);
    }
  }

  function handleClick(action: Action) {
    if (DESTRUCTIVE_ACTIONS.has(action)) {
      setConfirming(action);
      return;
    }
    void run(action, false);
  }

  return (
    <tr>
      <td>
        <div className="instance-name">{instance.displayName || instance.name}</div>
        <div className="instance-ip">{instance.ipv4 ?? "–"}</div>
      </td>
      <td>{instance.defaultUser ?? "–"}</td>
      <td>{instance.hostSystem ?? "–"}</td>
      <td>
        <StatusBadge status={instance.status} />
      </td>
      <td className="actions-cell">
        <ActionButton action="start" disabled={busy} onClick={() => handleClick("start")} />
        <ActionButton action="stop" disabled={busy} onClick={() => handleClick("stop")} />
        <ActionButton action="restart" disabled={busy} onClick={() => handleClick("restart")} />
        {error && <span className="error-text">{error}</span>}
      </td>

      {confirming && (
        <ConfirmModal
          title={`${instance.displayName || instance.name}: ${confirming}?`}
          description="Diese Aktion wirkt sich sofort auf die laufende VM aus."
          onCancel={() => setConfirming(null)}
          onConfirm={() => {
            const action = confirming;
            setConfirming(null);
            void run(action, true);
          }}
        />
      )}
    </tr>
  );
}
