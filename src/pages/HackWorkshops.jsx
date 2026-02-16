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
    <div
      className="min-h-screen py-8 px-4 font-sans text-gray-900 bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url('${bgImage}')` }}
    >
      <header className="text-center mb-10">
        <div className="relative w-full max-w-[700px] mx-auto mb-6 flex items-center gap-4">
          <input
            type="text"
            placeholder="Search hackathons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 py-4 px-6 pr-12 rounded-[30px] border-none outline-none text-[1.1rem] text-white placeholder:text-white placeholder:opacity-80"
            style={{
              background: "linear-gradient(90deg, #a18cd1, #fbc2eb)",
              opacity: showForm ? 0.5 : 1,
              pointerEvents: showForm ? 'none' : 'auto'
            }}
            disabled={showForm}
          />
        </div>
      </header>

      <div className="flex justify-center items-center gap-4 mt-6 mb-8">
        <div className="flex gap-3">
          {["All", "Hackathon", "Workshop"].map((f) => (
            <button
              key={f}
              className={`py-[0.7rem] px-5 font-medium text-[0.9rem] border-none rounded-xl cursor-pointer transition-colors duration-300 ${filter === f
                  ? "text-white"
                  : "bg-gray-100 text-gray-900"
                }`}
              style={filter === f ? { background: "linear-gradient(90deg, #ff6a00, #ee0979)" } : {}}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          className="py-[0.7rem] px-6 text-white font-semibold text-base border-none rounded-[20px] cursor-pointer flex items-center gap-1.5"
          style={{ background: "linear-gradient(90deg, #ff6a00, #ee0979)" }}
          onClick={() => setShowForm(true)}
        >
          <FaPlus className="mr-1.5" /> Add hackathons & workshops
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000]">
          <div className="bg-white p-8 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] w-[90%] max-w-[500px] flex flex-col gap-4">
            <h3 className="m-0 mb-4 text-2xl font-bold text-gray-800">Add New Hackathon/Workshop</h3>
            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full py-3 px-3 border border-gray-300 rounded-lg text-base"
            />
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full py-3 px-3 border border-gray-300 rounded-lg text-base"
            >
              <option value="Hackathon">Hackathon</option>
              <option value="Workshop">Workshop</option>
            </select>
            <input
              type="date"
              placeholder="Date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full py-3 px-3 border border-gray-300 rounded-lg text-base"
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full py-3 px-3 border border-gray-300 rounded-lg text-base"
            ></textarea>
            <input
              type="file"
              onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
              className="w-full py-3 px-3 border border-gray-300 rounded-lg text-base"
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={handleAddEvent}
                className="py-3 px-6 text-white font-semibold text-base border-none rounded-lg cursor-pointer"
                style={{ background: "linear-gradient(90deg, #ff6a00, #ee0979)" }}
              >
                Submit
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="py-3 px-6 bg-transparent text-gray-800 font-semibold text-base border border-gray-300 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="flex flex-col gap-8">
        {loading ? (
          <div className="bg-white rounded-[18px] shadow-[0_6px_24px_rgba(0,0,0,0.13)] p-8 text-center italic">
            Loading your events...
          </div>
        ) : displayedEvents.length === 0 ? (
          <div className="bg-white rounded-[18px] shadow-[0_6px_24px_rgba(0,0,0,0.13)] p-8 text-center">
            No events found. Add your first hackathon or workshop!
          </div>
        ) : (
          displayedEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-[18px] shadow-[0_6px_24px_rgba(0,0,0,0.13)] py-8 px-6 relative flex flex-col gap-4">
              <div className="absolute top-5 left-5 py-1.5 px-5 rounded-[14px] font-bold text-base bg-white border-2 border-[#ff6a00] text-[#ff6a00]">
                {event.type}
              </div>
              <div className="flex flex-row items-start gap-8">
                <div className="flex-1">
                  <h3 className="text-[#3a3aee] text-[1.1rem] font-bold mt-2 mb-2">{event.type}</h3>
                  <h4 className="text-[#3a3aee] text-base font-semibold mt-1 mb-2">{event.title}</h4>
                  <span className="text-[0.95rem] text-gray-500 mb-[0.7rem] block">{event.date}</span>
                  <p className="text-gray-600 text-base mb-[0.7rem]">{event.description}</p>
                </div>
                <div className="w-[150px] h-[150px] bg-gray-100 rounded-xl p-2 flex flex-col items-center shadow-[0_2px_8px_rgba(0,0,0,0.08)] justify-center overflow-hidden">
                  {event.file && event.file.url ? (
                    <>
                      {console.log('Rendering image for event:', event.id, 'URL:', event.file.url)}
                      <img
                        src={event.file.url}
                        alt="Certificate"
                        className="w-full h-full object-cover rounded-lg cursor-pointer transition-transform duration-200 hover:scale-105 block"
                        referrerPolicy="no-referrer"
                        onClick={() => window.open(event.file.url, '_blank')}
                        title="Click to view full image"
                        onError={(e) => {
                          console.error('IMG tag failed to load:', event.file.url);
                          e.target.style.display = 'none';
                          const backgroundDiv = e.target.nextSibling;
                          if (backgroundDiv) {
                            backgroundDiv.style.display = 'block';
                          }
                        }}
                        onLoad={(e) => {
                          console.log('Image loaded successfully!', {
                            url: event.file.url,
                            naturalWidth: e.target.naturalWidth,
                            naturalHeight: e.target.naturalHeight,
                          });
                        }}
                      />
                      {/* Alternative: Background image approach */}
                      <div
                        className="hidden w-full h-full bg-cover bg-center bg-no-repeat rounded-lg cursor-pointer"
                        style={{ backgroundImage: `url(${event.file.url})` }}
                        onClick={() => window.open(event.file.url, '_blank')}
                        title="Click to view full image"
                      ></div>

                      {/* Fallback file icon (initially hidden) */}
                      <div className="hidden flex-col items-center justify-center h-full w-full">
                        <FaFileAlt
                          className="text-[3rem] text-[#a18cd1] mb-2 cursor-pointer"
                          onClick={() => window.open(event.file.url, '_blank')}
                          title="Click to download"
                        />
                        <span className="text-[0.9rem] text-gray-500">
                          {event.file.type || 'FILE'}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <FaFileAlt className="text-[3rem] text-gray-300 mb-2" />
                      <span className="text-[0.9rem] text-gray-400">No File</span>
                    </div>
                  )}
                </div>

                {/* Status below the JPG box */}
                <div className="text-center mt-2">
                  {event.status === "Approved" ? (
                    <span className="text-green-500 font-bold text-[0.9rem]">
                      <FaCheckCircle className="inline mr-1" /> Approved
                    </span>
                  ) : (
                    <span className="text-orange-500 font-bold text-[0.9rem]">
                      <FaExclamationCircle className="inline mr-1" /> Pending
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}