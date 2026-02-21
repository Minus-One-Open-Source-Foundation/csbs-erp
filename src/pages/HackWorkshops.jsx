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
      className="min-h-screen py-8 px-4 font-sans text-gray-900 bg-cover bg-center bg-fixed max-sm:py-4 max-sm:px-2"
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

      <div className="flex justify-center items-center gap-4 mt-6 mb-8 flex-wrap max-sm:flex-col max-sm:gap-3">
        <div className="flex gap-3 flex-wrap max-sm:gap-2 max-sm:justify-center">
          {["All", "Hackathon", "Workshop"].map((f) => (
            <button
              key={f}
              className={`py-[0.7rem] px-5 font-medium text-[0.9rem] border-none rounded-xl cursor-pointer transition-colors duration-300 max-sm:py-2 max-sm:px-3 max-sm:text-[0.8rem] ${filter === f
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
          className="py-[0.7rem] px-6 text-white font-semibold text-base border-none rounded-[20px] cursor-pointer flex items-center gap-1.5 max-sm:w-full max-sm:justify-center max-sm:py-3 max-sm:text-[0.9rem]"
          style={{ background: "linear-gradient(90deg, #ff6a00, #ee0979)" }}
          onClick={() => setShowForm(true)}
        >
          <FaPlus className="mr-1.5" /> Add hackathons & workshops
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000]">
          <div className="bg-white p-8 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] w-[90%] max-w-[500px] flex flex-col gap-4 max-sm:w-[95vw] max-sm:p-5">
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
            <div key={event.id} className="bg-white rounded-[18px] shadow-[0_6px_24px_rgba(0,0,0,0.13)] py-6 px-5 relative flex flex-col md:flex-row gap-4 md:gap-8 md:py-8 md:px-6">
              <div className="absolute top-4 left-4 py-2 px-6 rounded-full font-extrabold text-lg bg-white border-2 border-[#ff6a00] text-[#ff6a00]">
                {event.type}
              </div>
              <div className="flex flex-col md:flex-row items-start gap-6 md:gap-8 w-full">
                <div className="flex-1 flex flex-col">
                  <h3 className="order-1 text-[#3a3aee] text-[1.05rem] font-semibold mt-2 mb-2">{event.type}</h3>
                  <h3 className="order-2 text-[1.3rem] font-semibold text-gray-800 mb-3 pb-2 border-b-2 border-gray-300">Title:</h3>
                  <h4 className="order-2 text-[#111827] text-2xl font-extrabold mt-1 mb-2 leading-tight">{event.title}</h4>

                  {/* Centered image placed directly under the title on mobile */}
                  <div className="order-3 w-full max-w-[420px] h-[300px] mx-auto my-4 rounded-xl p-2 bg-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden">
                    {event.file && event.file.url ? (
                      <img
                        src={event.file.url}
                        alt="Event Image"
                        className="w-full h-auto object-contain rounded-lg cursor-pointer transition-transform duration-200 hover:scale-105"
                        referrerPolicy="no-referrer"
                        onClick={() => window.open(event.file.url, '_blank')}
                        title="Click to view full image"
                        onError={(e) => {
                          console.error('IMG tag failed to load:', event.file.url);
                          e.target.style.display = 'none';
                        }}
                        onLoad={(e) => {
                          console.log('Image loaded successfully!', {
                            url: event.file.url,
                            naturalWidth: e.target.naturalWidth,
                            naturalHeight: e.target.naturalHeight,
                          });
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6">
                        <FaFileAlt className="text-[3rem] text-gray-300 mb-2" />
                        <span className="text-[0.9rem] text-gray-400">No File</span>
                      </div>
                    )}
                  </div>

                  <h4 className="order-4 text-[1.1rem] font-semibold text-gray-800 mb-2 mt-3">Date of completion:</h4>
                  <span className="order-4 text-[1rem] text-gray-500 mb-[0.7rem] block">{event.date}</span>
                  <h4 className="order-5 text-[1.1rem] font-semibold text-gray-800 mb-2 mt-3">Description:</h4>
                  <p className="order-5 text-gray-500 text-base mb-[0.7rem]">{event.description}</p>
                </div>

                {/* Status */}
                <div className="text-center mt-2 md:mt-0 md:self-start">
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