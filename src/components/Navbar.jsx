import { AppBar, Toolbar, Typography, Button, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar({ onToggleSidebar }) {
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
        {user && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open sidebar"
            onClick={onToggleSidebar}
            sx={{ mr: 1, display: { xs: "inline-flex", md: "none" } }} // Hide hamburger on desktop
          >
            <MenuIcon />
          </IconButton>
        )}
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            letterSpacing: "0.5px",
            color: "#ffd700",
          }}
        >
          {user
            ? (user.role && user.role.toLowerCase() === "faculty")
              ? "Faculty Hub"
              : "Student Activity Hub"
            : "Student Activity Hub"}
        </Typography>
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          {user ? (
            <>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  color: "#000",
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
              sx={{
                border: "1px solid white",
                borderRadius: "10px",
                px: 2,
                "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
              }}
            >
              Login
            </Button>
          )}
        </div>
      </Toolbar>
    </AppBar>
  );
}
