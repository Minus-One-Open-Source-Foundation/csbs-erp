import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  FaTachometerAlt,
  FaUser,
  FaLaptopCode,
  FaBriefcase,
  FaAward,
  FaTrophy,
  FaFileAlt,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

export default function Sidebar({ open = false, collapsed = false, onClose, onToggleCollapse }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: "/", label: "Dashboard", icon: FaTachometerAlt },
    { to: "/personal-info", label: "Personal Info", icon: FaUser },
    { to: "/hackathons-workshops", label: "Hackathons & Workshops", icon: FaLaptopCode },
    { to: "/internships", label: "Internships", icon: FaBriefcase },
    { to: "/activities", label: "Certifications", icon: FaAward },
    { to: "/achievements", label: "Achievements", icon: FaTrophy },
    { to: "/urms", label: "URMS", icon: FaFileAlt },
  ];

  return (
    <div
      className={`group/sidebar fixed left-0 top-0 h-screen flex flex-col pt-[80px] pb-[22px] box-border font-sans text-white z-[1199]
        transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
        max-[520px]:w-[86vw] max-[520px]:min-w-[86vw] max-[520px]:p-4 max-[520px]:pt-[56px]
        ${open
          ? "translate-x-0 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
          : "-translate-x-[102%]"
        }
        min-[900px]:translate-x-0 min-[900px]:shadow-none min-[900px]:z-[1000]
        ${collapsed ? "min-[900px]:w-[60px] min-[900px]:min-w-[60px] px-2" : "min-[900px]:w-[250px] min-[900px]:min-w-[250px] px-[22px]"}
      `}
      style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
    >
      {/* Collapse Toggle Button — only visible on desktop */}
      <button
        onClick={onToggleCollapse}
        className="hidden min-[900px]:flex absolute -right-3 top-[92px] w-6 h-6 rounded-full bg-white text-indigo-600 shadow-[0_2px_8px_rgba(0,0,0,0.15)] items-center justify-center cursor-pointer border-none z-[1201] transition-all duration-200 hover:scale-110 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <FaChevronRight className="text-[0.6rem]" /> : <FaChevronLeft className="text-[0.6rem]" />}
      </button>

      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
        {/* Title */}
        <h2
          className={`mb-[26px] text-center font-bold leading-[1.08] bg-clip-text max-[520px]:text-[1.15rem] transition-all duration-300 whitespace-nowrap overflow-hidden ${collapsed ? "min-[900px]:text-[0px] min-[900px]:opacity-0 min-[900px]:h-0 min-[900px]:mb-2" : "text-[1.46rem] opacity-100"
            }`}
          style={{
            background: "linear-gradient(90deg, #fff, #ffd700)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Student Hub
        </h2>

        {/* Navigation */}
        <nav className="flex flex-col gap-[6px] w-full items-center">
          {navItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={i}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `group/item relative flex items-center justify-center gap-3 rounded-xl no-underline text-white font-semibold border border-white/10 transition-all duration-200
                  ${collapsed
                    ? "w-10 h-10 p-0" // Perfectly square and centered when collapsed
                    : "w-full px-[18px] py-3 justify-start"
                  }
                  ${isActive
                    ? "bg-white/15 shadow-[0_8px_26px_rgba(238,9,121,0.13)] border-[#ffd700]/60"
                    : "bg-white/[0.06] hover:bg-white/10"
                  }`
                }
                onClick={onClose}
                title={collapsed ? item.label : undefined}
              >
                <div className="flex items-center justify-center w-6 h-6 shrink-0">
                  <Icon className={`transition-all duration-200 ${collapsed ? "text-[1.1rem]" : "text-[1.05rem]"}`} />
                </div>

                <span
                  className={`whitespace-nowrap transition-all duration-300 text-[0.92rem] overflow-hidden ${collapsed ? "w-0 opacity-0 absolute" : "w-auto opacity-100 static"
                    }`}
                >
                  {item.label}
                </span>

                {/* Tooltip on hover when collapsed */}
                {collapsed && (
                  <div className="hidden min-[900px]:block absolute left-full ml-3 py-1.5 px-3 bg-slate-900 text-white text-[0.8rem] font-medium rounded-md whitespace-nowrap opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-200 pointer-events-none shadow-[0_4px_12px_rgba(0,0,0,0.3)] z-[1300]">
                    {item.label}
                    <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Logout */}
      <div className={`mt-auto w-full flex items-center ${collapsed ? "justify-center" : "px-0"}`}>
        <button
          className={`border-none text-white rounded-xl cursor-pointer font-bold shadow-[0_8px_26px_rgba(238,9,121,0.13)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(238,9,121,0.18)] flex items-center justify-center gap-2 ${collapsed ? "w-10 h-10 p-0 rounded-xl" : "w-full py-[13px] px-5 text-base"
            }`}
          style={{ background: "linear-gradient(90deg, #ff6a00, #ee0979)" }}
          onClick={() => {
            logout();
            navigate("/login");
          }}
          title={collapsed ? "Logout" : undefined}
        >
          <div className="flex items-center justify-center w-6 h-6 shrink-0">
            <FaSignOutAlt className={`${collapsed ? "text-[1.1rem]" : "text-base"}`} />
          </div>
          <span className={`whitespace-nowrap transition-all duration-300 overflow-hidden ${collapsed ? "w-0 opacity-0 absolute" : "w-auto opacity-100 static"}`}>
            Logout
          </span>
        </button>
      </div>
    </div>
  );
}
