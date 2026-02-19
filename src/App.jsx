import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { useAuth } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import FacultyLayout from "./components/FacultyLayout";

// Auth Pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Student Pages
import Dashboard from "./pages/Dashboard";
import PersonalInfo from "./pages/PersonalInfo";
import Activities from "./pages/Activities";
import Achievements from "./pages/Achievements";
import HackWorkshops from "./pages/HackWorkshops";
import Internships from "./pages/Internships";
import URMS from "./pages/URMS";

// Faculty Pages
import FacultyDashboard from "./pages/FacultyDashboard";
import StudentManagement from "./pages/StudentManagement";
import GradeManagement from "./pages/GradeManagement";
import Reports from "./pages/Reports";
import FacultyInternshipsRequests from "./pages/FacultyInternshipsRequests";
import AchievementsRequest from "./pages/AchievementsRequest";

function App() {
  const { user } = useAuth();

  // 🎨 Enhanced MUI Theme
  // 🎨 MUI Theme
  const theme = createTheme({
    palette: {
      mode: "light",
      primary: { main: "#1976d2" },
      secondary: { main: "#9c27b0" },
      background: { default: "#f5f6fa" },
    },
    shape: { borderRadius: 12 },
  });

  // 🔒 Not logged in → only login/register allowed
  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </ThemeProvider>
    );
  }

  // ✅ Logged in → route based on user role
  if (user.role === "FACULTY" || user.role === "faculty") {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <FacultyLayout>
          <Routes>
            <Route path="/faculty" element={<FacultyDashboard />} />
            <Route path="/faculty/students" element={<StudentManagement />} />
            <Route path="/faculty/grades" element={<GradeManagement />} />
            <Route path="/faculty/reports" element={<Reports />} />
            <Route path="/faculty/internships-requests" element={<FacultyInternshipsRequests />} />
            <Route path="/faculty/achievements-requests" element={<AchievementsRequest />} />
            <Route path="*" element={<Navigate to="/faculty" replace />} />
          </Routes>
        </FacultyLayout>
      </ThemeProvider>
    );
  }

  // ✅ Student pages
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/personal-info" element={<PersonalInfo />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/hackathons-workshops" element={<HackWorkshops />} />
          <Route path="/internships" element={<Internships />} />
          <Route path="/urms" element={<URMS />} />

          {/* 🚦 Default Redirect → Student Dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </ThemeProvider>
  );
}

export default App;
