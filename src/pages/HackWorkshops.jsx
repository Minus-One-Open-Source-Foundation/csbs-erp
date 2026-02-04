import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaPlus, FaSearch, FaCheckCircle, FaExclamationCircle, FaFileAlt } from "react-icons/fa";
import { eventsAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import bgImage from "../assets/bg.jpg";

export default function HackWorkshops() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load events from backend on component mount
  useEffect(() => {
    const loadEvents = async () => {
      if (user?.email) {
        try {
          const userEvents = await eventsAPI.getUserEvents(user.email);
          console.log('Raw events from backend:', userEvents);
          
          // Transform backend data to match existing UI structure
          const transformedEvents = userEvents.map(event => {
            console.log('Processing event:', {
              id: event.id,
              imageUrl: event.imageUrl,
              fileName: event.fileName,
              status: event.status
            });
            
            return {
              id: event.id,
              title: event.title,
              type: event.type === 'HACKATHON' ? 'Hackathon' : 'Workshop',
              date: event.eventDate,
              description: event.description,
              file: event.imageUrl ? { 
                name: event.fileName || 'certificate.jpg', 
                type: event.fileName ? event.fileName.split('.').pop().toUpperCase() : 'JPEG',
                url: event.imageUrl 
              } : null,
              status: event.status === 'APPROVED' ? 'Approved' : 'Pending',
            };
          });
          
          console.log('Transformed events:', transformedEvents);
          setEvents(transformedEvents);
        } catch (error) {
          console.error('Failed to load events:', error);
        }
      }
      setLoading(false);
    };
    
    loadEvents();
  }, [user]);

  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    type: "Hackathon",
    date: "",
    description: "",
    file: null,
    status: "Pending",
  });
  const [filter, setFilter] = useState("All");

  const handleAddEvent = async () => {
    if (!user?.email) {
      toast.error('Please log in to add events');
      return;
    }

    // Validate required fields
    if (!formData.title.trim()) {
      toast.warning('Please enter a title');
      return;
    }
    if (!formData.description.trim()) {
      toast.warning('Please enter a description');
      return;
    }
    if (!formData.date) {
      toast.warning('Please select an event date');
      return;
    }

    console.log('Submitting event with data:', {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      date: formData.date,
      userEmail: user.email,
      hasFile: !!formData.file
    });

    try {
      // Transform UI data to backend format
      const eventData = {
        title: formData.title,
        description: formData.description,
        type: formData.type === 'Hackathon' ? 'HACKATHON' : 'WORKSHOP',
        eventDate: formData.date,
        userEmail: user.email
      };

      console.log('Sending to backend:', eventData);
      console.log(`Backend URL: ${import.meta.env.VITE_API_URL || ''}/api/events/create`);
      
      const response = await eventsAPI.createEvent(eventData, formData.file);
      console.log('Backend response:', response);
      
      // Reload events to get the updated list
      const userEvents = await eventsAPI.getUserEvents(user.email);
      const transformedEvents = userEvents.map(event => ({
        id: event.id,
        title: event.title,
        type: event.type === 'HACKATHON' ? 'Hackathon' : 'Workshop',
        date: event.eventDate,
        description: event.description,
        file: event.imageUrl ? { 
          name: event.fileName || 'certificate.jpg', 
          type: event.fileName ? event.fileName.split('.').pop().toUpperCase() : 'JPG',
          url: event.imageUrl 
        } : null,
        status: event.status === 'APPROVED' ? 'Approved' : 'Pending',
      }));
      setEvents(transformedEvents);

      setShowForm(false);
      setFormData({
        title: "",
        type: "Hackathon",
        date: "",
        description: "",
        file: null,
        status: "Pending",
      });

      toast.success('Event added successfully!');
    } catch (error) {
      console.error('Failed to add event:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        formData: {
          title: formData.title,
          type: formData.type,
          date: formData.date,
          description: formData.description,
          hasFile: !!formData.file
        }
      });
      
      let errorMessage = 'Failed to add event. ';
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage += 'Bad request - please check all fields are filled correctly.';
      } else if (error.response?.status === 401) {
        errorMessage += 'Please log in again.';
      } else if (error.response?.status === 500) {
        errorMessage += 'Server error - please try again later.';
      } else {
        errorMessage += error.message || 'Please try again.';
      }
      
      toast.error(errorMessage);
    }
  };

  const filteredEvents = events.filter((ev) =>
    ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ev.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedEvents = filter === "All" ? filteredEvents : filteredEvents.filter(ev => ev.type === filter);

  return (
    <div className="hackworkshops-wrapper">
      <header>
        <div className="search-bar-wrapper">
          <input
            type="text"
            placeholder="Search hackathons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar"
            disabled={showForm}
            style={{ 
              opacity: showForm ? 0.5 : 1,
              pointerEvents: showForm ? 'none' : 'auto'
            }}
          />
        </div>
      </header>

      <div className="top-controls" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem", marginTop: "1.5rem" }}>
        <div className="filters" style={{ display: "flex", gap: "0.7rem" }}>
          {["All", "Hackathon", "Workshop"].map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <button className="add-btn" onClick={() => setShowForm(true)}>
          <FaPlus style={{ marginRight: 6 }} /> Add hackathons & workshops
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-form">
            <h3>Add New Hackathon/Workshop</h3>
            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={{ width: "100%", padding: "0.8rem", border: "1px solid #ddd", borderRadius: "8px", fontSize: "1rem" }}
            />
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              style={{ width: "100%", padding: "0.8rem", border: "1px solid #ddd", borderRadius: "8px", fontSize: "1rem" }}
            >
              <option value="Hackathon">Hackathon</option>
              <option value="Workshop">Workshop</option>
            </select>
            <input
              type="date"
              placeholder="Date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
            <input
              type="file"
              onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
            />
            <div className="modal-actions">
              <button onClick={handleAddEvent}>Submit</button>
              <button
                onClick={() => setShowForm(false)}
                style={{ padding: "0.8rem 1.5rem", background: "none", color: "#333", fontWeight: 600, fontSize: "1rem", border: "1px solid #ddd", borderRadius: "8px", cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="cards-container">
        {loading ? (
          <div className="event-card" style={{ textAlign: 'center', padding: '2rem', fontStyle: 'italic' }}>
            Loading your events...
          </div>
        ) : displayedEvents.length === 0 ? (
          <div className="event-card" style={{ textAlign: 'center', padding: '2rem' }}>
            No events found. Add your first hackathon or workshop!
          </div>
        ) : (
          displayedEvents.map((event) => (
            <div key={event.id} className="event-card">
              <div className={`badge ${event.type.toLowerCase()}`}>{event.type}</div>
              <div className="event-main">
                <div className="event-info">
                  <h3 className="event-title">{event.type}</h3> {/* Hackathon */}
                  <h4 className="event-subtitle">{event.title}</h4> {/* Hackathon title */}
                  <span className="date">{event.date}</span>
                  <p>{event.description}</p>
                </div>
                <div className="file-preview">
                  {event.file && event.file.url ? (
                    <>
                      {console.log('Rendering image for event:', event.id, 'URL:', event.file.url)}
                      {/* Force image display with multiple approaches */}
                      <img 
                        src={event.file.url}
                        alt="Certificate" 
                        className="file-image"
                        referrerPolicy="no-referrer"
                        onClick={() => window.open(event.file.url, '_blank')}
                        style={{ 
                          cursor: "pointer",
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "8px",
                          display: "block"
                        }}
                        title="Click to view full image"
                        onError={(e) => {
                          console.error('IMG tag failed to load:', event.file.url);
                          console.log('Trying background image approach...');
                          
                          // Hide the failed img tag
                          e.target.style.display = 'none';
                          
                          // Show the background image div
                          const backgroundDiv = e.target.nextSibling;
                          if (backgroundDiv) {
                            backgroundDiv.style.display = 'block';
                            console.log('Switched to background image approach');
                          } else {
                            // If background div doesn't work, show file icon
                            const fallback = e.target.nextSibling?.nextSibling;
                            if (fallback) fallback.style.display = 'flex';
                          }
                        }}
                        onLoad={(e) => {
                          console.log('Image loaded successfully!', {
                            url: event.file.url,
                            naturalWidth: e.target.naturalWidth,
                            naturalHeight: e.target.naturalHeight,
                            displayWidth: e.target.width,
                            displayHeight: e.target.height
                          });
                        }}
                      />
                      {/* Alternative: Background image approach */}
                      <div 
                        style={{ 
                          display: "none", 
                          width: "100%",
                          height: "100%",
                          backgroundImage: `url(${event.file.url})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          backgroundRepeat: "no-repeat",
                          borderRadius: "8px",
                          cursor: "pointer"
                        }}
                        onClick={() => window.open(event.file.url, '_blank')}
                        title="Click to view full image"
                      ></div>
                      
                      {/* Fallback file icon (initially hidden) */}
                      <div 
                        style={{ 
                          display: "none", 
                          flexDirection: "column", 
                          alignItems: "center", 
                          justifyContent: "center", 
                          height: "100%",
                          width: "100%" 
                        }}
                      >
                        <FaFileAlt 
                          className="file-logo" 
                          style={{ 
                            fontSize: "3rem",
                            color: "#a18cd1",
                            marginBottom: "0.5rem",
                            cursor: "pointer"
                          }} 
                          onClick={() => window.open(event.file.url, '_blank')}
                          title="Click to download"
                        />
                        <span className="file-type" style={{ fontSize: "0.9rem", color: "#666" }}>
                          {event.file.type || 'FILE'}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
                      <FaFileAlt style={{ fontSize: "3rem", color: "#ccc", marginBottom: "0.5rem" }} />
                      <span className="file-type" style={{ fontSize: "0.9rem", color: "#999" }}>No File</span>
                    </div>
                  )}
                </div>
                
                {/* Status below the JPG box */}
                <div className="status-box" style={{ textAlign: "center", marginTop: "0.5rem" }}>
                  {event.status === "Approved" ? (
                    <span className="approved" style={{ color: "#4CAF50", fontWeight: "bold", fontSize: "0.9rem" }}>
                      <FaCheckCircle style={{ marginRight: "4px" }} /> Approved
                    </span>
                  ) : (
                    <span className="pending" style={{ color: "#FF9800", fontWeight: "bold", fontSize: "0.9rem" }}>
                      <FaExclamationCircle style={{ marginRight: "4px" }} /> Pending
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      <style>{`
        .hackworkshops-wrapper {
          min-height: 100vh;
          padding: 2rem 1rem;
          font-family: 'Inter', sans-serif;
          background: url('${bgImage}') no-repeat center center fixed;
          background-size: cover;
          color: #111;
        }
        header { text-align: center; margin-bottom: 2.5rem; }
        .search-bar-wrapper {
          position: relative;
          width: 100%;
          max-width: 700px;
          margin: 0 auto 1.5rem auto;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .search-bar {
          flex: 1;
          padding: 1rem 3rem 1rem 1.5rem;
          border-radius: 30px;
          border: none;
          background: linear-gradient(90deg,#a18cd1,#fbc2eb);
          color: #fff;
          font-size: 1.1rem;
          outline: none;
        }
        .search-bar::placeholder { color: #fff; opacity: 0.8; }
        .add-btn {
          padding: 0.7rem 1.5rem;
          background: linear-gradient(90deg,#ff6a00,#ee0979);
          color: #fff;
          font-weight: 600;
          font-size: 1rem;
          border: none;
          border-radius: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal-form {
          background: #fff;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          width: 90%;
          max-width: 500px;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .modal-form h3 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: #333;
        }
        .modal-form input,
        .modal-form textarea {
          width: 100%;
          padding: 0.8rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
        }
        .modal-actions button {
          padding: 0.8rem 1.5rem;
          background: linear-gradient(90deg,#ff6a00,#ee0979);
          color: #fff;
          font-weight: 600;
          font-size: 1rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }
        .top-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        .filters {
          display: flex;
          gap: 1rem;
        }
        .filter-btn {
          padding: 0.7rem 1.2rem;
          background: #f3f4f6;
          color: #111;
          font-weight: 500;
          font-size: 0.9rem;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.3s;
        }
        .filter-btn.active {
          background: linear-gradient(90deg,#ff6a00,#ee0979);
          color: #fff;
        }
        .cards-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .event-card {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 6px 24px rgba(0,0,0,0.13);
          padding: 2rem 1.6rem;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .badge {
          position: absolute;
          top: 1.2rem;
          left: 1.2rem;
          padding: 0.4rem 1.2rem;
          border-radius: 14px;
          font-weight: 700;
          font-size: 1rem;
          background: #fff;
          border: 2px solid #ff6a00;
          color: #ff6a00;
        }
        .badge.hackathon { border-color: #ff6a00; color: #ff6a00; }
        .status-box.below {
          font-size: 1rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center; /* Center alignment */
          gap: 0.3rem;
          margin-top: 1rem; /* Adjusted spacing */
        }
        .approved { color: #10b981; }
        .pending { color: #ff4b5c; }
        .event-main {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          gap: 2rem;
        }
        .event-info {
          flex: 1;
        }
        .event-info h3.event-title {
          color: #3a3aee;
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0.5rem 0 0.5rem 0;
        }
        .event-info h4.event-subtitle {
          color: #3a3aee;
          font-size: 1rem;
          font-weight: 600;
          margin: 0.3rem 0 0.5rem 0; /* Added spacing */
        }
        .date {
          font-size: 0.95rem;
          color: #777;
          margin-bottom: 0.7rem;
          display: block;
        }
        .event-info p {
          color: #444;
          font-size: 1rem;
          margin-bottom: 0.7rem;
        }
        .file-preview {
          width: 150px;
          height: 150px;
          background: #f3f3f3;
          border-radius: 12px;
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          justify-content: center;
          overflow: hidden;
        }
        .file-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 8px;
          transition: transform 0.2s ease;
        }
        .file-image:hover {
          transform: scale(1.05);
        }
        .file-logo {
          font-size: 2rem;
          color: #a18cd1;
          margin-bottom: 0.5rem;
        }
        .file-type {
          font-size: 1.1rem;
          color: #7b7b7b;
          font-weight: 700;
          margin-top: 0.5rem;
        }
        .file-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
      `}</style>
    </div>
  );
}