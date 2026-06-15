import { Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import { useAuth } from "./auth";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SearchClinics from "./pages/SearchClinics";
import Appointments from "./pages/Appointments";
import Availability from "./pages/Availability";
import Profile from "./pages/Profile";
import Icon from "./components/Icon";
import { Role } from "./types";
import { ReactNode } from "react";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  return (
    <div className="navbar">
      <span className="brand">NewClinic</span>
      <div className="nav-links">
        {user.role === "PATIENT" && (
          <Link to="/buscar">
            <Icon name="search" size={18} />
            Buscar Clinicas
          </Link>
        )}
        {user.role === "CLINIC" && (
          <Link to="/disponibilidade">
            <Icon name="schedule" size={18} />
            Disponibilidade
          </Link>
        )}
        <Link to="/agendamentos">
          <Icon name="event" size={18} />
          Agendamentos
        </Link>
        <Link to="/perfil">
          <Icon name="manage_accounts" size={18} />
          Meu Perfil
        </Link>
        <span className="nav-greeting">
          <Icon name="account_circle" size={18} />
          Ola, {user.name}
        </span>
        <button
          className="btn secondary"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          <Icon name="logout" size={18} />
          Sair
        </button>
      </div>
    </div>
  );
}

// Protege rotas; opcionalmente restringe por papel
function Protected({ children, role }: { children: ReactNode; role?: Role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/agendamentos" replace />;
  return <>{children}</>;
}

export default function App() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/agendamentos" /> : <Login />} />
          <Route path="/cadastro" element={user ? <Navigate to="/agendamentos" /> : <Register />} />

          <Route
            path="/buscar"
            element={
              <Protected role="PATIENT">
                <SearchClinics />
              </Protected>
            }
          />
          <Route
            path="/disponibilidade"
            element={
              <Protected role="CLINIC">
                <Availability />
              </Protected>
            }
          />
          <Route
            path="/agendamentos"
            element={
              <Protected>
                <Appointments />
              </Protected>
            }
          />
          <Route
            path="/perfil"
            element={
              <Protected>
                <Profile />
              </Protected>
            }
          />

          <Route path="*" element={<Navigate to={user ? "/agendamentos" : "/login"} replace />} />
        </Routes>
      </div>
    </>
  );
}
