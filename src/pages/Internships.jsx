import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  FaPlus,
  FaCheckCircle,
  FaExclamationCircle,
  FaFileAlt,
  FaSpinner,
} from "react-icons/fa";
import { internshipAPI } from "../services/api";
import bgImage from "../assets/bg.jpg";

export default function Internships() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    startDate: "",
    endDate: "",
    companyName: "",
    description: "",
    mode: "",
    certificate: null,
  });

  // Get user email from localStorage
  const getUserEmail = () => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      return user.email;
    }
    return null;
  };

  // Fetch user internships on component mount
  useEffect(() => {
    fetchUserInternships();
  }, []);

  const fetchUserInternships = async () => {
    try {
      setLoading(true);
      const userEmail = getUserEmail();
      if (!userEmail) {
        setError('Please log in to view your internships');
        return;
      }

      const internships = await internshipAPI.getUserInternships(userEmail);
      setEvents(internships);
      setError(null);
    } catch (err) {
      console.error('Error fetching internships:', err);
      setError('Failed to load internships. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddInternship = async () => {
    try {
      setSubmitting(true);
      const userEmail = getUserEmail();
      if (!userEmail) {
        toast.error('Please log in to submit an internship');
        return;
      }

      // Validate form data
      if (!formData.title || !formData.companyName || !formData.startDate || !formData.endDate || !formData.mode) {
        toast.warning('Please fill in all required fields');
        return;
      }

      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('companyName', formData.companyName);
      submitData.append('mode', formData.mode);
      submitData.append('startDate', formData.startDate);
      submitData.append('endDate', formData.endDate);
      submitData.append('description', formData.description);
      submitData.append('userEmail', userEmail);

      if (formData.certificate) {
        submitData.append('certificate', formData.certificate);
      }

      // Submit to backend
      const response = await internshipAPI.createInternship(submitData);

      if (response.success) {
        // Refresh the internships list
        await fetchUserInternships();
        setShowForm(false);
        setFormData({
          title: "",
          startDate: "",
          endDate: "",
          companyName: "",
          description: "",
          mode: "",
          certificate: null,
        });
        toast.success('Internship submitted successfully!');
      } else {
        toast.error(response.message || 'Failed to submit internship');
      }
    } catch (err) {
      console.error('Error submitting internship:', err);
      toast.error('Failed to submit internship. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEvents = events.filter((ev) =>
    ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ev.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formInputClass = "w-full py-[0.7rem] px-4 rounded-lg border border-gray-300 outline-none text-base";

  return (
    <div
      className="min-h-screen py-8 px-4 font-sans text-gray-900 bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url('${bgImage}')` }}
    >
      {/* Header */}
      <header className="text-center mb-10 mt-10">
        <div className="relative w-full max-w-[700px] mx-auto mb-6 flex items-center gap-4">
          <input
            type="text"
            placeholder="Search internships..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 py-4 px-6 pr-12 rounded-[30px] border-none bg-white/70 text-gray-800 text-[1.1rem] outline-none w-[580px]"
          />
          <button
            className="py-[0.7rem] px-6 text-white font-semibold text-base border-none rounded-[20px] cursor-pointer flex items-center gap-1.5"
            style={{ background: "linear-gradient(90deg, #ff6a00, #ee0979)" }}
            onClick={() => setShowForm(true)}
          >
            <FaPlus className="mr-1.5" /> Add internships
          </button>
        </div>
      </header>

      {showForm && (
        <div className="fixed top-8 left-0 w-full h-full bg-black/50 flex justify-center items-center z-[1000]">
          <div className="w-[70%] max-w-[350px] bg-white py-5 px-5 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] flex flex-col gap-[1.1rem] max-h-[92vh] overflow-y-auto fixed top-[60px] left-1/2 -translate-x-1/2 z-[1100]">
            <h3 className="m-0 mb-4 text-2xl font-bold text-gray-800">
              Add New Internship
            </h3>
            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={formInputClass}
            />
            <input
              type="text"
              placeholder="Company Name"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className={formInputClass}
            />
            <select
              value={formData.mode || ""}
              onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
              className={formInputClass}
            >
              <option value="" disabled>Select Internship Mode</option>
              <option value="REMOTE">Remote</option>
              <option value="ONSITE">On-site</option>
              <option value="HYBRID">Hybrid</option>
            </select>
            <label className="font-medium mb-0.5 ml-2">Start Date</label>
            <input
              type="date"
              placeholder="dd-mm-yyyy"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className={formInputClass}
            />
            <label className="font-medium mb-0.5 ml-2">End Date</label>
            <input
              type="date"
              placeholder="dd-mm-yyyy"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className={formInputClass}
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              maxLength={100}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`${formInputClass} min-h-[120px] max-h-[120px] resize-none`}
            />
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setFormData({ ...formData, certificate: e.target.files[0] })}
              className="w-full py-3 px-3 border border-gray-300 rounded-lg text-base"
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={handleAddInternship}
                disabled={submitting}
                className="py-3 px-6 text-white font-semibold text-base border-none rounded-lg flex items-center gap-2 disabled:cursor-not-allowed"
                style={{
                  background: submitting ? "#ccc" : "linear-gradient(90deg, #ff6a00, #ee0979)",
                  cursor: submitting ? "not-allowed" : "pointer",
                }}
              >
                {submitting && <FaSpinner className="animate-spin" />}
                {submitting ? "Submitting..." : "Submit"}
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

      {/* Loading State */}
      {loading && (
        <div className="text-center p-12">
          <FaSpinner className="animate-spin text-[2rem] text-blue-600 mx-auto" />
          <p>Loading your internships...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center p-12 bg-white/90 rounded-lg mx-auto my-8 max-w-[500px]">
          <p className="text-red-600 text-[1.1rem] mb-4">{error}</p>
          <button
            onClick={fetchUserInternships}
            className="py-2 px-4 bg-blue-600 text-white border-none rounded cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* No Internships State */}
      {!loading && !error && filteredEvents.length === 0 && (
        <div className="text-center p-12 bg-white/90 rounded-lg mx-auto my-8 max-w-[500px]">
          <p>No internships found. Click "Add internships" to create your first internship entry.</p>
        </div>
      )}

      {/* Cards */}
      {!loading && !error && filteredEvents.length > 0 && (
        <section className="flex flex-col gap-8">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-[18px] shadow-[0_6px_24px_rgba(0,0,0,0.13)] py-8 px-6 flex flex-col gap-4 relative"
            >
              <div className="absolute top-5 left-5 py-1.5 px-5 rounded-[14px] font-bold text-base bg-white border-2 border-[#ff6a00] text-[#ff6a00]">
                Internship
              </div>
              <div className="flex flex-row items-start gap-8 mt-4">
                <div className="flex-1">
                  <h3 className="text-[#3a3aee] text-[1.1rem] font-bold mt-4 mb-2">
                    {event.title}
                  </h3>
                  <span className="text-base text-gray-500 font-semibold mb-2 block">
                    {event.companyName}
                  </span>
                  <span className="text-[0.95rem] text-gray-500 mb-[0.7rem] block">
                    {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                  </span>
                  <div className="text-base text-[#3a3aee] font-semibold mb-[0.7rem] text-left">
                    Internship mode: <span className="text-gray-800 font-medium">{event.mode || 'REMOTE'}</span>
                  </div>
                  <p className="text-gray-600 text-base mb-[0.7rem]">
                    {event.description}
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  {/* Document preview box */}
                  <div className="w-[180px] h-[160px] min-w-[180px] min-h-[160px] border-2 border-dashed border-gray-400 rounded-xl bg-white flex items-center justify-center relative overflow-hidden">
                    {event.certificateUrl ? (
                      <img
                        src={event.certificateUrl}
                        alt="Certificate"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-gray-500 text-[0.9rem]">
                        <FaFileAlt className="text-[2rem] mb-2 mx-auto" />
                        <br />No certificate
                      </div>
                    )}
                  </div>
                  {/* Status below the rectangle box */}
                  <div className="mt-[0.7rem] text-center">
                    {event.status === "APPROVED" ? (
                      <span className="text-green-500 font-bold text-[0.95rem] inline-flex items-center gap-1.5 bg-green-50 rounded-lg py-1.5 px-3.5 border-[1.5px] border-green-500">
                        <FaCheckCircle className="mr-1" /> Approved
                      </span>
                    ) : event.status === "REJECTED" ? (
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
          ))}
        </section>
      )}
    </div>
  );
}
