import React, { useCallback, useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import bgImage from "../assets/bg.jpg";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Persist collapsed state across navigation
    const saved = localStorage.getItem("sidebar-collapsed");
    return saved === "true";
  });

  const toggleSidebar = useCallback(() => setSidebarOpen((s) => !s), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleCollapse = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setSidebarOpen(false);
      // Ctrl+B to toggle collapse on desktop
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        toggleCollapse();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [toggleCollapse]);

  return (
    <div className="flex min-h-screen w-full font-sans max-md:flex-col">
      <Navbar onToggleSidebar={toggleSidebar} collapsed={sidebarCollapsed} onToggleCollapse={toggleCollapse} />
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[1198] bg-black/35 min-[900px]:hidden"
          onClick={closeSidebar}
        />
      )}
      <Sidebar
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        onClose={closeSidebar}
        onToggleCollapse={toggleCollapse}
      />
      <main
        className={`flex-1 p-4 pt-[calc(64px+12px)] overflow-y-auto min-h-screen box-border bg-cover bg-center bg-fixed flex flex-col scrollbar-thin max-md:p-3 max-md:pt-[calc(56px+10px)] max-[480px]:p-2 max-[480px]:pt-[calc(48px+8px)] transition-[margin-left,width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${sidebarCollapsed
          ? "min-[900px]:ml-[60px] min-[900px]:w-[calc(100%-60px)]"
          : "min-[900px]:ml-[250px] min-[900px]:w-[calc(100%-250px)]"
          }`}
        style={{ backgroundImage: `url('${bgImage}')` }}
      >
        {children}
      </main>
    </div>
  );
}
