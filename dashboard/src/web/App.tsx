import { useEffect, useState } from "react";
import { getSession, logout } from "./api/client.js";
import { LoginPage } from "./components/LoginPage.js";
import { InstanceTable } from "./components/InstanceTable.js";
import { ChatPanel } from "./components/ChatPanel.js";

export function App() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    void getSession().then((s) => setAuthenticated(s.authenticated));
  }, []);

  if (authenticated === null) {
    return <div className="loading-screen">Lade…</div>;
  }

  if (!authenticated) {
    return <LoginPage onLoggedIn={() => setAuthenticated(true)} />;
  }

  return (
    <div className="app-layout">
      <header className="app-header">
        <h1>Contabo Dashboard</h1>
        <button
          className="btn-secondary"
          onClick={() => void logout().then(() => setAuthenticated(false))}
        >
          Abmelden
        </button>
      </header>
      <main className="app-main">
        <InstanceTable />
        <ChatPanel />
      </main>
    </div>
  );
}
