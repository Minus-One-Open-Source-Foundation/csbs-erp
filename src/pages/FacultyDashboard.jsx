import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/bg.jpg";

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  // Carousel logic
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [showNext, setShowNext] = useState(false);

  // Mock fetch (replace with API call later)
  useEffect(() => {
    setRequests([
      {
        id: 1,
        type: "Internship",
        student: "John Doe",
        details: "Company: TechCorp | Duration: 6 months",
      },
      {
        id: 2,
        type: "Hackathon",
        student: "Jane Smith",
        details: "Event: National Hackathon 2025 | Date: Oct 15, 2025",
      },
      {
        id: 3,
        type: "Workshop",
        student: "Mike Johnson",
        details: "Workshop: AI & ML | Date: Nov 2, 2025",
      },
    ]);
  }, []);

  const placementCards = [
    { company: "Zoho", logo: "src/assets/zoho.png" },
    { company: "Amazon", logo: "src/assets/amazon.png" },
    { company: "Accenture", logo: "src/assets/accenture.png" },
    { company: "TVS", logo: "src/assets/tvs.png" },
    { company: "TCS", logo: "src/assets/tcs.png" },
    { company: "MRF", logo: "src/assets/mrf.png" },
    { company: "ibm", logo: "src/assets/ibm.png" },
    { company: "mips", logo: "src/assets/mips.png" },
    { company: "tcs_ele", logo: "src/assets/tcs_ele.png" },
  ];

  useEffect(() => {
    if (animating) return;
    const interval = setInterval(() => {
      setShowNext(true);
      setAnimating(true);
      setTimeout(() => {
        setCarouselIndex((prev) => (prev + 1) % placementCards.length);
        setShowNext(false);
        setAnimating(false);
      }, 400);
    }, 2500);
    return () => clearInterval(interval);
  }, [animating, placementCards.length]);

  const handleAction = (id, action) => {
    setRequests((prev) => prev.filter((req) => req.id !== id));
    toast.success(`Request ${action} successfully!`);
  };

  return (
    <div
      className="min-h-[120vh] overflow-y-auto p-8 font-sans bg-cover bg-center bg-fixed relative max-sm:p-4 max-[480px]:p-3"
      style={{ backgroundImage: `url('${bgImage}')` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-[6px] -z-[1]" />

      {/* Header */}
      <header className="text-center mb-10">
        <h1 className="text-[2.2rem] font-bold text-slate-800 mb-2 max-sm:text-[1.5rem]">Faculty Dashboard</h1>
        <p className="text-slate-700">
          Signed in as: <span className="font-semibold text-slate-900">faculty@test.com</span>
        </p>
      </header>

      {/* Dashboard Navigation */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6 mb-12 max-w-[1000px] mx-auto max-[480px]:grid-cols-1">
        <div
          className="text-white p-7 rounded-[18px] text-center transition-all duration-300 shadow-[0_12px_48px_rgba(0,0,0,0.2)] backdrop-blur-[12px] border border-white/10 cursor-pointer hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-[0_16px_60px_rgba(0,0,0,0.3)] max-md:p-5"
          style={{ background: "linear-gradient(135deg, rgba(48, 54, 79, 0.35), rgba(172, 186, 196, 0.15))" }}
          onClick={() => navigate("/faculty/students")}
        >
          <h3 className="text-[1.3rem] mb-3 font-bold text-white">Student Management</h3>
          <p className="text-[0.95rem] text-white/90">Manage student profiles</p>
        </div>
        <div
          className="text-white p-7 rounded-[18px] text-center transition-all duration-300 shadow-[0_12px_48px_rgba(0,0,0,0.2)] backdrop-blur-[12px] border border-white/10 cursor-pointer hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-[0_16px_60px_rgba(0,0,0,0.3)] max-md:p-5"
          style={{ background: "linear-gradient(135deg, rgba(48, 54, 79, 0.35), rgba(172, 186, 196, 0.15))" }}
          onClick={() => navigate("/faculty/grades")}
        >
          <h3 className="text-[1.3rem] mb-3 font-bold text-white">Grade Management</h3>
          <p className="text-[0.95rem] text-white/90">Review and update student performance</p>
        </div>
        <div
          className="text-white p-7 rounded-[18px] text-center transition-all duration-300 shadow-[0_12px_48px_rgba(0,0,0,0.2)] backdrop-blur-[12px] border border-white/10 cursor-pointer hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-[0_16px_60px_rgba(0,0,0,0.3)] max-md:p-5"
          style={{ background: "linear-gradient(135deg, rgba(48, 54, 79, 0.35), rgba(172, 186, 196, 0.15))" }}
          onClick={() => navigate("/faculty/reports")}
        >
          <h3 className="text-[1.3rem] mb-3 font-bold text-white">Hackathons And Workshops Requests</h3>
          <p className="text-[0.95rem] text-white/90">Manage all hackathon and workshop requests efficiently.</p>
        </div>
      </div>

      {/* Current Placement Drive Section */}
      <h2 className="text-center text-2xl font-semibold mt-8 mb-4 text-slate-800">Current Placement Drive - On Campus</h2>
      <div
        className="w-[1000px] max-w-full mx-auto mb-10 rounded-[18px] border-[1.5px] border-white/25 py-10 px-10 min-h-[240px] flex items-center justify-center max-sm:py-4 max-sm:px-4 max-sm:min-h-[180px]"
        style={{
          background: "rgba(200, 200, 200, 0.35)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.18), 0 1.5px 8px 0 rgba(255,255,255,0.25) inset",
        }}
      >
        <div className="w-full overflow-hidden relative h-[140px] flex items-center justify-center">
          <div className="w-full h-full relative flex items-center justify-center">
            <div
              className="flex gap-6 w-4/5 min-w-0 absolute top-[-6%] left-[12%] justify-center transition-transform duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{
                transform: animating ? 'translateX(-100%)' : 'translateX(0)',
                zIndex: animating ? 1 : 2,
              }}
            >
              {placementCards.slice(carouselIndex, carouselIndex + 1).map((card, idx) => (
                <div className="bg-white rounded-[14px] shadow-[0_4px_24px_rgba(0,0,0,0.08)] py-10 px-10 flex flex-col items-center w-full max-w-full min-w-0 transition-shadow duration-300 max-sm:py-4 max-sm:px-4" key={idx}>
                  <img src={card.logo} alt="Company Logo" className="w-[120px] h-[120px] object-contain mb-5 -mt-6 max-sm:w-[80px] max-sm:h-[80px] max-sm:mb-3 max-sm:-mt-2" />
                  <div className="font-bold text-slate-800 text-2xl text-center">{card.company}</div>
                </div>
              ))}
            </div>
            {showNext && (
              <div
                className="flex gap-6 w-4/5 min-w-0 absolute top-[-6%] left-[12%] justify-center transition-transform duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] z-[2]"
                style={{ transform: animating ? 'translateX(0)' : 'translateX(100%)' }}
              >
                {placementCards.slice((carouselIndex + 1) % placementCards.length, (carouselIndex + 2) % placementCards.length).map((card, idx) => (
                  <div className="bg-white rounded-[14px] shadow-[0_4px_24px_rgba(0,0,0,0.08)] py-10 px-10 flex flex-col items-center w-full max-w-full min-w-0 transition-shadow duration-300" key={idx}>
                    <img src={card.logo} alt="Company Logo" className="w-[120px] h-[120px] object-contain mb-5 -mt-6" />
                    <div className="font-bold text-slate-800 text-2xl text-center">{card.company}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Requests Section */}
      <div
        className="min-h-screen overflow-visible p-8 font-sans text-gray-900 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url('${bgImage}')` }}
      >
      </div>
    </div>
  );
}
