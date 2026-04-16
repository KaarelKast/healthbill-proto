import { Outlet, NavLink } from "react-router-dom";
import "./AppShell.css";

export default function AppShell() {
  return (
    <div className="app-shell">
      <nav className="app-nav">
        <NavLink to="/invoices" className="app-nav-brand">
          <span className="app-nav-brand-health">Health</span>
          <span className="app-nav-brand-bill">Bill</span>
        </NavLink>
        <div className="app-nav-links">
          <NavLink
            to="/invoices"
            className={({ isActive }) => `app-nav-link${isActive ? ' active' : ''}`}
          >
            Raviarved
          </NavLink>
          <NavLink
            to="/partner-invoices"
            className={({ isActive }) => `app-nav-link${isActive ? ' active' : ''}`}
          >
            Partnerarved
          </NavLink>
        </div>
      </nav>
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}
