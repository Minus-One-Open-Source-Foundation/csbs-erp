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
      <Toolbar
        sx={{
          minHeight: { xs: 48, sm: 56, md: 64 },
          px: { xs: 1, sm: 2, md: 3 },
        }}
      >
        {/* Mobile hamburger menu */}
        {user && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open sidebar"
            onClick={onToggleSidebar}
            className="mr-1 md:!hidden"
            sx={{ display: { xs: "inline-flex", md: "none" }, p: { xs: 0.5, sm: 1 } }}
          >
            <MenuIcon sx={{ fontSize: { xs: "1.2rem", sm: "1.5rem" } }} />
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
          sx={{
            color: "#ffd700",
            fontSize: { xs: "0.85rem", sm: "1rem", md: "1.25rem" },
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: { xs: "120px", sm: "200px", md: "none" },
            lineHeight: 1.2,
          }}
        >
          {user
            ? (user.role && user.role.toLowerCase() === "faculty")
              ? "Faculty Hub"
              : "Student Activity Hub"
            : "Student Activity Hub"}
        </Typography>
        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          {user ? (
            <>
              <Typography
                variant="body1"
                className="font-semibold"
                sx={{
                  color: "#000",
                  display: { xs: "none", sm: "none", md: "block" },
                  fontSize: { md: "0.9rem" },
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "250px",
                }}
              >
                Welcome, {user.email}
              </Typography>
              <Button
                onClick={logout}
                sx={{
                  background: "linear-gradient(90deg,#ff6a00,#ee0979)",
                  color: "#fff",
                  borderRadius: "12px",
                  px: { xs: 1.5, sm: 2, md: 2.5 },
                  py: { xs: 0.6, sm: 0.8, md: 1.2 },
                  fontWeight: 700,
                  fontSize: { xs: "0.75rem", sm: "0.85rem", md: "1rem" },
                  boxShadow: "0 8px 26px rgba(238,9,121,0.13)",
                  textTransform: "none",
                  minWidth: "auto",
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
