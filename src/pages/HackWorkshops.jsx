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
        <h1 className="text-[2.2rem] font-bold text-slate-800 mb-2 max-sm:text-[1.5rem]">
          Hackathons & Workshops
        </h1>
        <div className="flex justify-center mb-6 w-full">
          <input
            type="text"
            placeholder="Search hackathons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="py-4 pr-12 pl-6 rounded-[30px] border-none shadow-md text-white placeholder:text-white/70 text-[1.1rem] outline-none w-[580px] max-w-full transition-all duration-300 focus:shadow-lg"
            style={{
              background: "linear-gradient(135deg, #30364f, #acbac4)",
              opacity: showForm ? 0.3 : 1,
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
              style={filter === f ? { background: "linear-gradient(135deg, #eba97a, #f3da51)" } : {}}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          className="py-[0.7rem] px-6 text-white font-bold text-base border-none rounded-[20px] cursor-pointer flex items-center gap-1.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(235,169,122,0.4)] max-sm:w-full max-sm:justify-center max-sm:py-3 max-sm:text-[0.9rem]"
          style={{ background: "linear-gradient(135deg, #eba97a, #f3da51)" }}
          onClick={() => setShowForm(true)}
        >
          <FaPlus className="mr-1.5" /> Add hackathons & workshops
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000]">
          <div className="bg-white p-8 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] w-[90%] max-w-[500px] flex flex-col gap-4 max-sm:w-[95vw] max-sm:p-5">
            <h3 className="m-0 mb-4 text-2xl font-bold text-gray-800">Add New Hackathon/Workshop</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  placeholder="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full py-3 px-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-orange-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full py-3 px-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-orange-400 transition-colors"
                >
                  <option value="Hackathon">Hackathon</option>
                  <option value="Workshop">Workshop</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  placeholder="Date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full py-3 px-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-orange-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full py-3 px-3 border border-gray-300 rounded-lg text-base min-h-[100px] focus:outline-none focus:border-orange-400 transition-colors"
                ></textarea>
              </div>

              <div>
                <div className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg bg-white">
                  <label htmlFor="hack-file" className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold py-1.5 px-3 rounded border border-gray-400 cursor-pointer transition-colors">
                    Choose File
                  </label>
                  <span className="text-gray-500 text-sm truncate">
                    {formData.file ? formData.file.name : "No file chosen"}
                  </span>
                  <input
                    id="hack-file"
                    type="file"
                    onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                    className="hidden"
                    accept=".jpg,.jpeg,.png"
                  />
                </div>
                <small className="block mt-1 text-gray-500 text-xs">
                  Allowed formats: jpg, jpeg, png
                </small>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={handleAddEvent}
                className="py-3 px-8 text-white font-bold text-base border-none rounded-lg cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(235,169,122,0.4)]"
                style={{ background: "linear-gradient(135deg, #eba97a, #f3da51)" }}
              >
                Submit
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="py-3 px-8 bg-transparent text-gray-700 font-semibold text-base border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
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
            <div
              key={event.id}
              className="bg-white rounded-[18px] shadow-[0_6px_24px_rgba(0,0,0,0.13)] py-8 px-6 flex flex-col gap-4 relative max-sm:py-5 max-sm:px-4"
            >
              <div className="flex flex-row items-start gap-8 mt-4 max-md:flex-col">
                <div className="flex-1">
                  <div className="mb-2">
                    <span className="text-base text-black font-semibold mr-3">Title:</span>
                    <span className="text-base text-gray-600 font-medium leading-tight">{event.title}</span>
                  </div>

                  <div className="mb-2">
                    <span className="text-base text-black font-semibold mr-3">Category:</span>
                    <span className="text-base text-gray-600 font-medium">{event.type}</span>
                  </div>

                  <div className="mb-2">
                    <span className="text-base text-black font-semibold mr-3">Date:</span>
                    <span className="text-base text-gray-600">{event.date}</span>
                  </div>

                  <div className="mb-2">
                    <div className="text-base text-black font-semibold">Description:</div>
                    <div className="text-base text-gray-600 leading-relaxed ml-4">{event.description}</div>
                  </div>
                </div>

                <div className="order-first md:order-last mb-4 md:mb-0 flex flex-col items-center self-center md:self-auto">
                  {/* Image preview box */}
                  <div className="w-[180px] md:w-[240px] h-auto md:h-[180px] min-h-[160px] md:min-h-[180px] mx-auto border-2 border-dashed border-gray-400 rounded-xl bg-white flex items-center justify-center relative overflow-hidden max-md:min-w-0 max-md:h-[200px]">
                    {event.file && event.file.url ? (
                      <img
                        src={event.file.url}
                        alt="Event"
                        className="w-full h-full object-cover cursor-pointer transition-transform duration-200 hover:scale-105"
                        onClick={() => window.open(event.file.url, '_blank')}
                        title="Click to view full image"
                      />
                    ) : (
                      <div className="text-center text-gray-500 text-[0.9rem]">
                        <FaFileAlt className="text-[3rem] mb-2 mx-auto text-gray-300" />
                        <br />No Image
                      </div>
                    )}
                  </div>
                  {/* Status below the box */}
                  <div className="mt-[0.7rem] text-center">
                    {event.status === "Approved" ? (
                      <span className="text-green-500 font-bold text-[0.95rem] inline-flex items-center gap-1.5 bg-green-50 rounded-lg py-1.5 px-3.5 border-[1.5px] border-green-500">
                        <FaCheckCircle className="mr-1" /> Approved
                      </span>
                    ) : event.status === "Rejected" ? (
                      <span className="text-red-500 font-bold text-[0.95rem] inline-flex items-center gap-1.5 bg-red-50 rounded-lg py-1.5 px-3.5 border-[1.5px] border-red-500">
                        <FaExclamationCircle className="mr-1" /> Rejected
                      </span>
                    ) : (
                      <span className="text-orange-500 font-bold text-[0.95rem] inline-flex items-center gap-1.5 bg-amber-50 rounded-lg py-1.5 px-3.5 border-[1.5px] border-orange-500">
                        <FaExclamationCircle className="mr-1" /> Pending
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}