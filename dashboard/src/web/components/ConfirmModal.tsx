import { createPortal } from "react-dom";

// Rendered via a portal so callers can use this from inside a <tr> (or any
// other DOM-structure-sensitive parent) without producing invalid nesting.
export function ConfirmModal({
  title,
  description,
  onConfirm,
  onCancel,
}: {
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return createPortal(
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        <p>{description}</p>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onCancel}>
            Abbrechen
          </button>
          <button className="btn-danger" onClick={onConfirm}>
            Bestätigen
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
