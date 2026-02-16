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
    <div className="flex min-h-screen w-full font-sans max-md:flex-col">
      <Navbar onToggleSidebar={toggleSidebar} />
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[1198] bg-black/35 min-[900px]:hidden"
          onClick={closeSidebar}
        />
      )}
      <Sidebar open={sidebarOpen} onClose={closeSidebar} />
      <main
        className="flex-1 p-4 pt-[calc(64px+12px)] overflow-y-auto min-h-screen box-border bg-cover bg-center bg-fixed flex flex-col scrollbar-thin max-md:p-3 max-md:pt-[calc(56px+10px)] min-[900px]:ml-[250px] min-[900px]:w-[calc(100%-250px)]"
        style={{ backgroundImage: `url('${bgImage}')` }}
      >
        {children}
      </main>
    </div>
  );
}
