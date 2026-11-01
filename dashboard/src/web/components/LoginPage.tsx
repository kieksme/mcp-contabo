import { useState } from "react";
import { login } from "../api/client.js";

export function LoginPage({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(token);
      onLoggedIn();
    } catch (err) {
      setError("Zugangstoken ungültig.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Contabo Dashboard</h1>
        <p>Bitte mit dem Dashboard-Token anmelden.</p>
        <input
          type="password"
          autoFocus
          placeholder="Token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        {error && <div className="error-text">{error}</div>}
        <button type="submit" disabled={submitting || !token}>
          {submitting ? "Anmelden…" : "Anmelden"}
        </button>
      </form>
    </div>
  );
}
