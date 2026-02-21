import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function FacultySidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div
      className="w-[238px] text-white min-h-screen p-[22px] flex flex-col justify-between font-sans max-[520px]:!w-screen max-[520px]:!p-4"
      style={{ background: "linear-gradient(135deg, #30364f, #acbac4)" }}
    >
      <div>
        <h2
          className="mb-[26px] text-center font-bold text-[1.46rem] leading-[1.08] bg-clip-text max-[520px]:!text-[1.15rem]"
          style={{
            background: "linear-gradient(90deg, #fff, #ffd700)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Faculty Hub
        </h2>
        <nav className="flex flex-col gap-[10px]">
          {[
            { to: "/faculty/approvals", label: "Approvals Dashboard" },
            // Add more faculty links here as needed
          ].map((item, i) => (
            <NavLink
              key={i}
              to={item.to}
              className={({ isActive }) =>
                `py-3 px-[18px] rounded-xl no-underline text-white font-semibold text-base border border-white/12 transition-[box-shadow,background] duration-200 ${isActive
                  ? "bg-white/12 shadow-[0_8px_26px_rgba(78,84,200,0.13)] border-[#ffd700]"
                  : "bg-white/8"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <button
        className="mb-[60px] border-none py-[13px] px-5 text-white rounded-xl cursor-pointer font-bold text-base shadow-[0_8px_26px_rgba(78,84,200,0.13)] transition-transform duration-150 hover:-translate-y-0.5"
        style={{ background: "linear-gradient(90deg, #eba97a, #f3da51)" }}
        onClick={() => { logout(); navigate("/login"); }}
      >
        Logout
      </button>
    </div>
  );
}