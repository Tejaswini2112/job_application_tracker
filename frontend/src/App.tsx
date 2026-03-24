import type { ReactNode } from "react";
import {
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Applications } from "./pages/Applications";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";

function NavBar() {
  const { user, logout } = useAuth();
  return (
    <nav>
      <div className="inner">
        <div>
          <strong>Job Tracker</strong>
          {user && (
            <span className="muted" style={{ marginLeft: "0.75rem" }}>
              {user.firstName} {user.lastName}
            </span>
          )}
        </div>
        <div>
          {user ? (
            <>
              <Link to="/">Dashboard</Link>
              <Link to="/applications">Applications</Link>
              <button type="button" onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function RequireAuth() {
  const { token, loading } = useAuth();
  if (loading) {
    return (
      <div className="container">
        <p className="muted">Loading…</p>
      </div>
    );
  }
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return (
    <>
      <NavBar />
      <Outlet />
    </>
  );
}

function PublicOnly({ children }: { children: ReactNode }) {
  const { token, loading } = useAuth();
  if (loading) {
    return (
      <div className="container">
        <p className="muted">Loading…</p>
      </div>
    );
  }
  if (token) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnly>
            <NavBar />
            <Login />
          </PublicOnly>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnly>
            <NavBar />
            <Register />
          </PublicOnly>
        }
      />
      <Route element={<RequireAuth />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/applications" element={<Applications />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
