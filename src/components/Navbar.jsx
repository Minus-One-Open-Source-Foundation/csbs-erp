import { AppBar, Toolbar, Typography, Button, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useAuth } from "../contexts/AuthContext";
import { FaBars, FaChevronLeft } from "react-icons/fa";

export default function Navbar({ onToggleSidebar, collapsed, onToggleCollapse }) {
  const { user, logout } = useAuth();

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: "linear-gradient(135deg,#667eea 0%,#764ba2 100%)",
        boxShadow: 3,
      }}
    >
      <Toolbar>
        {/* Mobile hamburger menu */}
        {user && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open sidebar"
            onClick={onToggleSidebar}
            className="mr-2 md:!hidden"
            sx={{ display: { xs: "inline-flex", md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Desktop sidebar collapse toggle */}
        {user && onToggleCollapse && (
          <IconButton
            color="inherit"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={onToggleCollapse}
            sx={{
              display: { xs: "none", md: "inline-flex" },
              mr: 1,
              transition: "transform 0.2s ease",
              "&:hover": { transform: "scale(1.1)" },
            }}
            title={`${collapsed ? "Expand" : "Collapse"} sidebar (Ctrl+B)`}
          >
            {collapsed ? <FaBars style={{ fontSize: "1.1rem" }} /> : <FaChevronLeft style={{ fontSize: "1rem" }} />}
          </IconButton>
        )}

        <Typography
          variant="h6"
          className="font-bold tracking-wide"
          sx={{ color: "#ffd700" }}
        >
          {user
            ? (user.role && user.role.toLowerCase() === "faculty")
              ? "Faculty Hub"
              : "Student Activity Hub"
            : "Student Activity Hub"}
        </Typography>
        <div className="ml-auto flex items-center gap-4 max-sm:gap-2">
          {user ? (
            <>
              <Typography
                variant="body1"
                className="font-semibold max-sm:!hidden"
                sx={{ color: "#000" }}
              >
                Welcome, {user.email}
              </Typography>
              <Button
                onClick={logout}
                sx={{
                  background: "linear-gradient(90deg,#ff6a00,#ee0979)",
                  color: "#fff",
                  borderRadius: "12px",
                  px: 2.5,
                  py: 1.2,
                  fontWeight: 700,
                  fontSize: "1rem",
                  boxShadow: "0 8px 26px rgba(238,9,121,0.13)",
                  textTransform: "none",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 10px 30px rgba(238,9,121,0.18)",
                    background: "linear-gradient(90deg,#ff6a00,#ee0979)",
                  },
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <Button
              color="inherit"
              className="border border-white rounded-[10px] px-4 hover:bg-white/20"
            >
              Login
            </Button>
          )}
        </div>
      </Toolbar>
    </AppBar>
  );
}
