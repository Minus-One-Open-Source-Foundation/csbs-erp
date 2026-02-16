import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import bgImage from "../assets/bg.jpg";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Get user information from localStorage or context
  const getUserInfo = () => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('Dashboard - User data from localStorage:', parsedUser);
        return parsedUser;
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
    console.log('Dashboard - User data from context:', user);
    return user;
  };

  const currentUser = getUserInfo();

  const [personalInfo] = useState({
    name: currentUser?.username || currentUser?.name || "Student",
    dob: currentUser?.dateOfBirth || "Not specified",
    phone: currentUser?.phone || currentUser?.phoneNumber || "Not specified",
    address: "Not specified",
    email: currentUser?.email || "Not specified",
  });

  const [activities] = useState([
    { id: 1, title: "Hackathon", description: "Participated in SIH Hackathon", category: "Hackathon", status: "Approved" },
    { id: 2, title: "Workshop", description: "Attended AI Workshop", category: "Workshop", status: "Pending" },
    { id: 3, title: "Internship", description: "Summer internship at Infosys", category: "Internship", status: "Approved" },
  ]);

  const hackathonWorkshops = activities.filter(
    (a) => a.category === "Hackathon" || a.category === "Workshop"
  ).length;

  const internships = activities.filter((a) => a.category === "Internship").length;

  const achievements = activities.filter((a) => a.status === "Approved").length;

  return (
    <div
      className="min-h-screen w-full h-screen font-sans text-gray-900 bg-cover bg-center bg-fixed flex flex-col items-stretch justify-start"
      style={{ backgroundImage: `url('${bgImage}')` }}
    >
      <div className="w-full max-w-[1200px] mx-auto px-6 pt-16 pb-4 flex flex-col items-center">
        <h1 className="text-2xl m-0 mb-1 font-bold text-gray-900">
          Welcome, <span className="text-[#001f3f]">{personalInfo.name || "Student"}</span>
        </h1>
        <p className="text-base m-0 mb-6 text-black/70">Student Dashboard</p>

        {/* Stats Section */}
        <section className="w-full max-w-[920px] mb-6">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 max-[520px]:grid-cols-[repeat(auto-fit,minmax(140px,1fr))]">
            {/* Personal Info Card */}
            <div
              className="rounded-xl p-5 text-center shadow-[0_6px_18px_rgba(0,0,0,0.2)] backdrop-blur-[10px] transition-[transform,box-shadow] duration-200 cursor-pointer hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.25)]"
              style={{ background: "linear-gradient(145deg, rgba(128, 90, 213, 0.4), rgba(128, 90, 213, 0.2))" }}
              onClick={() => navigate("/personal-info")}
            >
              <h3 className="m-0 mb-1 text-[1.3rem] font-bold text-[#001f3f]">Personal Info</h3>
              <p className="text-[0.9rem] text-black mt-2 m-0">View and update your personal details.</p>
            </div>

            {/* Co-Curricular Card */}
            <div
              className="rounded-xl p-5 text-center shadow-[0_6px_18px_rgba(0,0,0,0.2)] backdrop-blur-[10px] transition-[transform,box-shadow] duration-200 cursor-pointer hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.25)]"
              style={{ background: "linear-gradient(145deg, rgba(128, 90, 213, 0.4), rgba(128, 90, 213, 0.2))" }}
              onClick={() => navigate("/activities")}
            >
              <h3 className="m-0 mb-1 text-[1.3rem] font-bold text-[#001f3f]">Co-Curricular</h3>
              <p className="text-[0.9rem] text-black mt-2 m-0">Track your co-curricular activities and achievements.</p>
            </div>

            {/* URMS Card */}
            <div
              className="rounded-xl p-5 text-center shadow-[0_6px_18px_rgba(0,0,0,0.2)] backdrop-blur-[10px] transition-[transform,box-shadow] duration-200 cursor-pointer hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.25)]"
              style={{ background: "linear-gradient(145deg, rgba(128, 90, 213, 0.4), rgba(128, 90, 213, 0.2))" }}
              onClick={() => navigate("/urms")}
            >
              <h3 className="m-0 mb-1 text-[1.3rem] font-bold text-[#001f3f]">URMS</h3>
              <p className="text-[0.9rem] text-black mt-2 m-0">Manage your role-based resumes for different companies.</p>
            </div>

            <div
              className="rounded-xl p-5 text-center shadow-[0_6px_18px_rgba(0,0,0,0.2)] backdrop-blur-[10px] transition-[transform,box-shadow] duration-200 cursor-pointer hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.25)]"
              style={{ background: "linear-gradient(145deg, rgba(128, 90, 213, 0.4), rgba(128, 90, 213, 0.2))" }}
              onClick={() => navigate("/hackathons-workshops")}
            >
              <h3 className="m-0 mb-1 text-[1.3rem] font-bold text-[#001f3f]">Hackathons & Workshops</h3>
              <p className="text-[0.9rem] text-black mt-2 m-0">Explore your participation in hackathons and workshops.</p>
            </div>

            <div
              className="rounded-xl p-5 text-center shadow-[0_6px_18px_rgba(0,0,0,0.2)] backdrop-blur-[10px] transition-[transform,box-shadow] duration-200 cursor-pointer hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.25)]"
              style={{ background: "linear-gradient(145deg, rgba(128, 90, 213, 0.4), rgba(128, 90, 213, 0.2))" }}
              onClick={() => navigate("/internships")}
            >
              <h3 className="m-0 mb-1 text-[1.3rem] font-bold text-[#001f3f]">Internships</h3>
              <p className="text-[0.9rem] text-black mt-2 m-0">Manage and track your internship experiences.</p>
            </div>

            <div
              className="rounded-xl p-5 text-center shadow-[0_6px_18px_rgba(0,0,0,0.2)] backdrop-blur-[10px] transition-[transform,box-shadow] duration-200 cursor-pointer hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.25)]"
              style={{ background: "linear-gradient(145deg, rgba(128, 90, 213, 0.4), rgba(128, 90, 213, 0.2))" }}
              onClick={() => navigate("/achievements")}
            >
              <h3 className="m-0 mb-1 text-[1.3rem] font-bold text-[#001f3f]">Approved Achievements</h3>
              <p className="text-[0.9rem] text-black mt-2 m-0">Review your approved achievements and milestones.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
