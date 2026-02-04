import React, { useCallback, useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import bgImage from "../assets/bg.jpg";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => setSidebarOpen((s) => !s), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setSidebarOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="layout-wrapper">
      <Navbar onToggleSidebar={toggleSidebar} />
      {sidebarOpen && <div className="overlay" onClick={closeSidebar} />}
      <Sidebar open={sidebarOpen} onClose={closeSidebar} />
      <main className="content">{children}</main>

      <style>{`
        /* Layout container */

        .layout-wrapper {
          display: flex;
          min-height: 100vh;
          width: 100%;
          background: none;
          font-family: 'Inter', sans-serif;
        }

        .overlay {
          position: fixed; inset: 0; z-index: 1198;
          background: rgba(0,0,0,0.35);
        }

        /* Main content area */

        .content {
          flex: 1;
          padding: 16px;
          padding-top: calc(64px + 12px);
          overflow-y: auto;
          min-height: 100vh;
          box-sizing: border-box;
          background: url('${bgImage}') no-repeat center center fixed;
          background-size: cover;
          display: flex;
          flex-direction: column;
        }

        /* Optional: smooth scroll for content */
        .content::-webkit-scrollbar { width: 8px; }
        .content::-webkit-scrollbar-thumb { background-color: rgba(0,0,0,0.2); border-radius: 4px; }
        .content::-webkit-scrollbar-track { background: transparent; }

        @media(max-width:768px){ .layout-wrapper { flex-direction: column; } .content { padding: 12px; padding-top: calc(56px + 10px); } }

        /* Desktop: Adjust content margin when sidebar is docked */
        @media (min-width: 900px) {
          .content {
            margin-left: 250px;
            width: calc(100% - 250px);
          }
           /* Hide overlay on desktop since sidebar is always visible */
          .overlay {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
