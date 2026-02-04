import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function FacultySidebar({ open = false, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const accentGradient = "linear-gradient(90deg,#ff6a00,#ee0979)";

  const linkStyle = {
    padding: "12px 18px",
    borderRadius: "12px",
    textDecoration: "none",
    color: "#fff",
    fontWeight: 600,
    background: "rgba(255,255,255,0.08)",
    transition: "box-shadow 0.22s, background 0.18s",
    border: "1px solid rgba(255,255,255,0.12)",
    fontSize: "1rem",
  };

  const activeStyle = {
    background: "rgba(255,255,255,0.12)",
    boxShadow: "0 8px 26px rgba(238,9,121,0.13)",
    borderColor: "#ffd700",
  };

  const navItems = [
    { to: "/faculty", label: "Dashboard" },
    { to: "/faculty/reports", label: "Hackathons And Workshops Requests" },
    { to: "/faculty/internships-requests", label: "Internships Requests" },
    { to: "/faculty/achievements-requests", label: "Achievements Requests" },
    { to: "/faculty/extra-activities", label: "Co-curriculars Requests" },
    { to: "/faculty/students", label: "Student Management" },
    { to: "/faculty/grades", label: "Grade Management" },
  ];

  return (
    <div className={`sidebar ${open ? "sidebar-open" : ""}`}>
      <div className="sidebar-top">
        <h2 className="sidebar-title">Facult Hub</h2>
        <nav className="sidebar-nav">
          {navItems.map((item, i) => (
            <NavLink
              key={i}
              to={item.to}
              style={({ isActive }) =>
                isActive ? { ...linkStyle, ...activeStyle } : linkStyle
              }
              onClick={onClose}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <button
        className="logout-btn"
        onClick={() => {
          logout();
          navigate("/login");
        }}
      >
        Logout
      </button>

      <style>{`
        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          height: 100vh;
          width: 250px;
          min-width: 250px;
          background: linear-gradient(135deg,#667eea 0%,#764ba2 100%);
          color: #fff;
          display: flex;
          flex-direction: column;
          padding: 22px;
          box-sizing: border-box;
          font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
          transform: translateX(-102%);
          transition: transform .24s ease, box-shadow .24s ease;
          z-index: 1199;
          padding-top: 80px; /* Space for navbar */
        }
        .sidebar-open { transform: translateX(0); box-shadow: 0 20px 60px rgba(0,0,0,0.35); }

        /* Desktop: Docked sidebar */
        @media (min-width: 900px) {
          .sidebar {
             transform: translateX(0);
             box-shadow: none;
             z-index: 1000;
          }
        }

        .sidebar-top { flex: 1; overflow-y: auto; }

        .sidebar-title {
          margin-bottom: 26px;
          text-align: center;
          font-weight: 700;
          font-size: 1.46rem;
          line-height: 1.08;
          background: linear-gradient(90deg,#fff,#ffd700);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .sidebar-nav { display: flex; flex-direction: column; gap: 10px; }

        .logout-btn {
          margin-top: 20px;
          background: ${accentGradient};
          border: none;
          padding: 13px 20px;
          color: #fff;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 700;
          font-size: 1rem;
          box-shadow: 0 8px 26px rgba(238,9,121,0.13);
          transition: transform .13s, box-shadow .2s;
        }

        .logout-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(238,9,121,0.18);
        }

        @media (max-width: 520px) {
          .sidebar { width: 86vw; min-width: 86vw; padding: 1rem; }
          .sidebar-title { font-size: 1.15rem; }
        }
      `}</style>
    </div>
  );
}
