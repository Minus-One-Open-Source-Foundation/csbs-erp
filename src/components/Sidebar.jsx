import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Sidebar({ open = false, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: "/", label: "Dashboard" },
    { to: "/personal-info", label: "Personal Info" },
    { to: "/hackathons-workshops", label: "Hackathons & Workshops" },
    { to: "/internships", label: "Internships" },
    { to: "/activities", label: "Co-Curricular" },
    { to: "/achievements", label: "Achievements" },
    { to: "/urms", label: "URMS" },
  ];

  return (
    <div
      className={`fixed left-0 top-0 h-screen w-[250px] min-w-[250px] flex flex-col p-[22px] pt-[80px] box-border font-sans text-white z-[1199] transition-[transform,box-shadow] duration-[240ms] ease-in-out max-[520px]:w-[86vw] max-[520px]:min-w-[86vw] max-[520px]:p-4 ${open
          ? "translate-x-0 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
          : "-translate-x-[102%]"
        } min-[900px]:translate-x-0 min-[900px]:shadow-none min-[900px]:z-[1000]`}
      style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
    >
      <div className="flex-1 overflow-y-auto">
        <h2
          className="mb-[26px] text-center font-bold text-[1.46rem] leading-[1.08] bg-clip-text max-[520px]:text-[1.15rem]"
          style={{
            background: "linear-gradient(90deg, #fff, #ffd700)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Student Hub
        </h2>
        <nav className="flex flex-col gap-[10px]">
          {navItems.map((item, i) => (
            <NavLink
              key={i}
              to={item.to}
              className={({ isActive }) =>
                `py-3 px-[18px] rounded-xl no-underline text-white font-semibold text-base border border-white/12 transition-[box-shadow,background] duration-200 ${isActive
                  ? "bg-white/12 shadow-[0_8px_26px_rgba(238,9,121,0.13)] border-[#ffd700]"
                  : "bg-white/8"
                }`
              }
              onClick={onClose}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <button
        className="mt-5 border-none py-[13px] px-5 text-white rounded-xl cursor-pointer font-bold text-base shadow-[0_8px_26px_rgba(238,9,121,0.13)] transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(238,9,121,0.18)]"
        style={{ background: "linear-gradient(90deg, #ff6a00, #ee0979)" }}
        onClick={() => {
          logout();
          navigate("/login");
        }}
      >
        Logout
      </button>
    </div>
  );
}
