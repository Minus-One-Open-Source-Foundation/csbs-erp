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
    <div className="faculty-dashboard">
      {/* Header */}
      <header>
        <h1>Faculty Dashboard</h1>
        <p>
          Signed in as: <span className="faculty-email">faculty@test.com</span>
        </p>
      </header>

      {/* Dashboard Navigation */}
      <div className="top-cards">
        <div className="card" onClick={() => navigate("/faculty/students")}>
          <h3>Student Management</h3>
          <p>Manage student profiles</p>
        </div>
        <div className="card" onClick={() => navigate("/faculty/grades")}>
          <h3>Grade Management</h3>
          <p>Review and update student performance</p>
        </div>
        <div className="card" onClick={() => navigate("/faculty/reports")}> 
          <h3>Hackathons And Workshops Requests</h3>
          <p>Manage all hackathon and workshop requests efficiently.</p>
        </div>
      </div>

      {/* Current Placement Drive Section */}
      <h2 className="placement-title">Current Placement Drive - On Campus</h2>
      <div className="placement-container">
        <div className="carousel-viewport">
          <div className="carousel-stack">
            <div className={`carousel-slide current${animating ? ' animating' : ''}`}
              style={animating ? { transform: 'translateX(-100%)' } : { transform: 'translateX(0)' }}>
              {placementCards.slice(carouselIndex, carouselIndex + 1).map((card, idx) => (
                <div className="placement-card" key={idx}>
                  <img src={card.logo} alt="Company Logo" className="company-logo" />
                  <div className="company-name">{card.company}</div>
                </div>
              ))}
            </div>
            {showNext && (
              <div className="carousel-slide next animating"
                style={{ transform: animating ? 'translateX(0)' : 'translateX(100%)' }}>
                {placementCards.slice((carouselIndex + 1) % placementCards.length, (carouselIndex + 2) % placementCards.length).map((card, idx) => (
                  <div className="placement-card" key={idx}>
                    <img src={card.logo} alt="Company Logo" className="company-logo" />
                    <div className="company-name">{card.company}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Requests Section */}
      <div className="dashboard-wrapper">
        <style>{`
          .faculty-dashboard {
            min-height: 120vh;
            overflow-y: auto;
            padding: 2rem;
            font-family: 'Inter', sans-serif;
            background: url('${bgImage}') no-repeat center center fixed;
            background-size: cover;
            position: relative;
          }

          /* Overlay */
          .faculty-dashboard::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.3);
            backdrop-filter: blur(6px);
            z-index: -1;
          }

          /* Header */
          header {
            text-align: center;
            margin-bottom: 2.5rem;
          }
          header h1 {
            font-size: 2.2rem;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 0.5rem;
          }
          header p {
            color: #334155;
          }
          .faculty-email {
            font-weight: 600;
            color: #0f172a;
          }

          /* Navigation Cards */
          .top-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 1.5rem;
            margin-bottom: 3rem;
            max-width: 1000px;
            margin-left: auto;
            margin-right: auto;
          }
          .card {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(20px);
            color: #1e293b;
            padding: 1.8rem;
            border-radius: 18px;
            text-align: center;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
            cursor: pointer;
          }
          .card:hover {
            transform: translateY(-6px) scale(1.02);
            box-shadow: 0 16px 60px rgba(0, 0, 0, 0.25);
          }
          .card h3 {
            font-size: 1.3rem;
            margin-bottom: 0.8rem;
          }
          .card p {
            font-size: 0.95rem;
            color: #374151;
          }

          /* Current Placement Drive Section */
          .placement-title {
            text-align: center;
            font-size: 1.5rem;
            font-weight: 600;
            margin-top: 2rem;
            margin-bottom: 1rem;
            color: #1e293b;
          }
          .placement-container {
            width: 1000px;
            max-width: 100%;
            margin: 0 auto 2.5rem auto;
            background: rgba(200, 200, 200, 0.35); /* glassy grey */
            backdrop-filter: blur(16px);
            border-radius: 18px;
            border: 1.5px solid rgba(255,255,255,0.25);
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18), 0 1.5px 8px 0 rgba(255,255,255,0.25) inset;
            padding: 2.5rem 2.5rem;
            min-height: 240px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .carousel-viewport {
            width: 100%;
            overflow: hidden;
            position: relative;
            height: 140px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .carousel-stack {
            width: 100%;
            height: 100%;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .carousel-slide {
            display: flex;
            gap: 1.5rem;
            width: 80%;
            min-width: 0;
            position: absolute;
            top: -6%;
            left: 12%;
            transform: translate(-50%, -50%);
            transition: transform 0.4s cubic-bezier(0.4,0,0.2,1);
            justify-content: center;
          }
          .carousel-slide.next.animating {
            z-index: 2;
          }
          .carousel-slide.current.animating {
            z-index: 1;
          }
          .placement-card {
            background: #fff;
            border-radius: 14px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.08);
            padding: 2.5rem 2.5rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            max-width: 100%;
            min-width: 0;
            transition: box-shadow 0.3s;
          }
          .placement-card .company-logo {
            width: 120px;
            height: 120px;
            object-fit: contain;
            margin-bottom: 1.2rem;
            margin-top: -24px;
          }
          .placement-card .company-name {
            font-weight: 700;
            color: #1e293b;
            font-size: 1.5rem;
            text-align: center;
          }

          /* Requests Section */
          .dashboard-wrapper {
            min-height: 100vh;
            overflow: visible;
            padding: 2rem;
            font-family: 'Inter', sans-serif;
            background: url('${bgImage}') no-repeat center center fixed;
            background-size: cover;
            color: #111;
          }

          @media (max-width: 768px) {
            .card {
              padding: 1.2rem;
            }
            header h1 {
              font-size: 1.6rem;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
