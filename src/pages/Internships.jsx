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

  const handleDescriptionChange = (e) => {
    const text = e.target.value;
    const words = text.trim().split(/\s+/).filter(Boolean);
    if (words.length <= 200) {
      setFormData({ ...formData, description: text });
    } else {
      const limited = words.slice(0, 200).join(' ');
      setFormData({ ...formData, description: limited });
    }
  };

  const filteredEvents = events.filter((ev) =>
    ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ev.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formInputClass = "w-full p-3 border border-gray-300 rounded-lg text-sm sm:text-base";

  return (
    <div
      className="min-h-screen py-8 px-4 font-sans text-gray-900 bg-cover bg-center bg-fixed max-sm:py-4 max-sm:px-2"
      style={{ backgroundImage: `url('${bgImage}')` }}
    >
      {/* Header */}
      <header className="text-center mb-10 mt-10 max-sm:mb-6 max-sm:mt-4">
        <div className="relative w-full max-w-[700px] mx-auto mb-6 flex items-center gap-4 max-sm:flex-col max-sm:gap-3">
          <input
            type="text"
            placeholder="Search internships..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 py-4 px-6 pr-12 rounded-[30px] border-none bg-white/70 text-gray-800 text-[1.1rem] outline-none w-full max-sm:py-3 max-sm:px-4 max-sm:text-base"
          />
          <button
            className="py-[0.7rem] px-6 text-white font-semibold text-base border-none rounded-[20px] cursor-pointer flex items-center gap-1.5 whitespace-nowrap max-sm:w-full max-sm:justify-center max-sm:py-3"
            style={{ background: "linear-gradient(90deg, #ff6a00, #ee0979)" }}
            onClick={() => setShowForm(true)}
          >
            <FaPlus className="mr-1.5" /> Add internships
          </button>
        </div>
      </header>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[12000]" onClick={() => setShowForm(false)}>
          <div className="bg-white p-6 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.12)] flex flex-col gap-4 w-[90%] max-w-[800px] max-h-[90vh] overflow-y-auto max-sm:w-[95%] max-sm:p-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="m-0 mb-2 text-2xl font-bold text-gray-800">Add New Internship</h3>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Title</label>
              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={formInputClass}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Company Name</label>
              <input
                type="text"
                placeholder="Company Name"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className={formInputClass}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Internship Mode</label>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                <input
                  type="date"
                  placeholder="dd-mm-yyyy"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className={formInputClass}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">End Date</label>
                <input
                  type="date"
                  placeholder="dd-mm-yyyy"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className={formInputClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Description</label>
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={handleDescriptionChange}
                className={`${formInputClass} min-h-[120px] max-h-[200px] resize-none`}
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 p-2 border border-gray-300 rounded-lg bg-gray-50 w-full">
                <label className="bg-white border border-gray-300 px-4 py-2 rounded-md cursor-pointer text-sm font-semibold hover:bg-gray-100 transition-colors shadow-sm whitespace-nowrap">
                  Choose File
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setFormData({ ...formData, certificate: e.target.files[0] })}
                    className="hidden"
                  />
                </label>
                <span className={`text-sm truncate ${formData.certificate ? 'text-blue-600 font-medium' : 'text-gray-500 italic'}`}>
                  {formData.certificate ? formData.certificate.name : 'No file chosen'}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">Allowed formats: jpg, jpeg, png</div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-4 mt-2 w-full">
              <button
                onClick={handleAddInternship}
                disabled={submitting}
                className="w-full sm:w-auto py-2.5 px-5 text-white border-none rounded-lg cursor-pointer font-semibold flex items-center gap-2 disabled:cursor-not-allowed justify-center"
                style={{
                  background: submitting ? '#ccc' : 'linear-gradient(90deg, #ff6a00, #ee0979)'
                }}
              >
                {submitting && <FaSpinner className="animate-spin" />}
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="w-full sm:w-auto bg-white text-black border border-gray-300 rounded-lg py-2.5 px-5 cursor-pointer"
                disabled={submitting}
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
              className="bg-white rounded-[18px] shadow-[0_6px_24px_rgba(0,0,0,0.13)] py-8 px-6 flex flex-col gap-4 relative max-sm:py-5 max-sm:px-4"
            >
              
              <div className="flex flex-row items-start gap-8 mt-4 max-md:flex-col">
                <div className="flex-1">
                  <div className="mb-2">
                    <span className="text-base text-black font-semibold mr-3">Title:</span>
                    <span className="text-base text-gray-600 font-medium leading-tight">{event.title}</span>
                  </div>

                  <div className="mb-2">
                    <span className="text-base text-black font-semibold mr-3">Company:</span>
                    <span className="text-base text-gray-600 font-medium leading-relaxed">{event.companyName}</span>
                  </div>

                  <div className="mb-2">
                    <span className="text-base text-black font-semibold mr-3">Duration:</span>
                    <span className="text-base text-gray-600 leading-relaxed">{new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}</span>
                  </div>

                  <div className="mb-2">
                    <span className="text-base text-black font-semibold mr-3">Mode:</span>
                    <span className="text-base text-gray-600 font-medium leading-relaxed">{event.mode || 'REMOTE'}</span>
                  </div>

                  <div className="mb-2">
                    <div className="text-base text-black font-semibold">Description:</div>
                    <div className="text-base text-gray-600 leading-relaxed ml-4">{event.description}</div>
                  </div>
                </div>
                <div className="order-first md:order-last mb-4 md:mb-0 flex flex-col items-center self-center md:self-auto">
                  {/* Document preview box */}
                  <div className="w-[180px] md:w-[180px] h-auto md:h-[160px] min-h-[160px] md:min-h-[160px] mx-auto border-2 border-dashed border-gray-400 rounded-xl bg-white flex items-center justify-center relative overflow-hidden max-md:min-w-0 max-md:h-[180px]">
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
