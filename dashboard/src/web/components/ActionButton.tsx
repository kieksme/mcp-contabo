const ICONS: Record<string, string> = {
  start: "▶",
  stop: "■",
  restart: "↻",
  shutdown: "⏻",
};

const LABELS: Record<string, string> = {
  start: "Start",
  stop: "Stop",
  restart: "Neustart",
  shutdown: "Herunterfahren",
};

export function ActionButton({
  action,
  disabled,
  onClick,
}: {
  action: "start" | "stop" | "restart" | "shutdown";
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`action-button action-${action}`}
      title={LABELS[action]}
      aria-label={LABELS[action]}
      disabled={disabled}
      onClick={onClick}
    >
      {ICONS[action]}
    </button>
  );
}
