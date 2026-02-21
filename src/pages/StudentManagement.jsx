import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaSearch, FaTrash } from "react-icons/fa";
import api from "../services/api";

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showReasonPopup, setShowReasonPopup] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");

  // Load all profiles on component mount
  useEffect(() => {
    loadAllProfiles();
  }, []);

  const loadAllProfiles = async () => {
    try {
      setLoading(true);
      console.log('🔄 Starting to load profiles...');
      const profiles = await api.getAllProfiles();
      console.log('✅ Profiles loaded successfully:', profiles);
      setStudents(profiles);
      setError(null);
    } catch (err) {
      console.error('❌ Error loading profiles:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data
      });
      setError(`Failed to load student profiles: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      (s.name && s.name.toLowerCase().includes(search.toLowerCase())) ||
      (s.registerNumber && s.registerNumber.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setShowConfirmPopup(true);
  };

  const confirmDelete = () => {
    setShowConfirmPopup(false);
    setShowReasonPopup(true);
  };

  const submitReason = async () => {
    if (deleteReason.trim() === "") {
      toast.warning("Please enter a reason for deletion.");
      return;
    }

    try {
      await api.deleteUserByEmail(studentToDelete.email);
      setStudents(students.filter((s) => s.email !== studentToDelete.email));
      console.log(
        `Student ${studentToDelete.name} deleted. Reason: ${deleteReason}`
      );
      toast.success(`Student ${studentToDelete.name} has been successfully deleted.`);
      setDeleteReason("");
      setStudentToDelete(null);
      setShowReasonPopup(false);
    } catch (err) {
      console.error('Error deleting student:', err);
      toast.error('Failed to delete student. Please try again.');
    }
  };

  return (
    <div className="w-full font-sans text-gray-900 animate-fade-in">
      <header className="text-center mb-10 mt-10">
        <h1 className="text-[2.2rem] font-bold text-slate-800 mb-2 max-sm:text-[1.5rem]">Student Management</h1>
        <p className="text-sm text-slate-500 mt-2">Manage student details and profiles</p>
      </header>

      {/* Search Bar */}
      <div className="flex justify-center mb-10">
        <input
          type="text"
          placeholder="Search by name or register number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="py-4 pr-12 pl-6 rounded-[30px] border-none shadow-md text-white placeholder:text-white/70 text-[1.1rem] outline-none w-[580px] max-w-full transition-all duration-300 focus:shadow-lg"
          style={{ background: "linear-gradient(135deg, #30364f, #acbac4)" }}
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center">
          <div className="w-8 sm:w-10 h-8 sm:h-10 border-4 border-gray-200 border-l-blue-500 rounded-full animate-spin mb-3 sm:mb-4"></div>
          <p className="text-sm sm:text-base">Loading students...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center">
          <p className="text-red-600 mb-4 text-sm sm:text-base md:text-lg">{error}</p>
          <button
            onClick={loadAllProfiles}
            className="bg-blue-500 text-white border-none py-2 sm:py-3 px-4 sm:px-6 rounded-lg cursor-pointer text-xs sm:text-sm md:text-base font-semibold transition-colors duration-200 hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      )}

      {/* Student Grid */}
      {!loading && !error && (
        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6 w-full">
            {filteredStudents.map((student) => (
              <div
                className="relative flex flex-col items-center text-center bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 lg:p-8 shadow-[0_4px_12px_rgba(0,0,0,0.08)] sm:shadow-[0_6px_20px_rgba(0,0,0,0.1)] transition-all duration-300 w-full hover:-translate-y-1 sm:hover:-translate-y-[3px] hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)] sm:hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)]"
                key={student.email}
              >
                {/* Delete Button */}
                <button
                  className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center border-none rounded bg-red-400 text-white cursor-pointer text-xs sm:text-sm hover:bg-red-600 transition-colors"
                  onClick={() => handleDeleteClick(student)}
                >
                  <FaTrash />
                </button>

                {/* Profile Photo */}
                <div className="flex flex-col items-center justify-center mb-3 sm:mb-4">
                  <div className="w-24 h-24 sm:w-32 md:w-36 lg:w-40 sm:h-32 md:h-36 lg:h-40 rounded-full overflow-hidden border-2 sm:border-[3px] border-gray-300 shadow-[0_4px_12px_rgba(0,0,0,0.15)] sm:shadow-[0_6px_18px_rgba(0,0,0,0.2)] flex items-center justify-center group">
                    <img
                      src={student.profileImageUrl || "/src/assets/default-profile.jpg"}
                      alt={student.name || "Student"}
                      onError={(e) => {
                        e.target.src = "/src/assets/default-profile.jpg";
                      }}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </div>

                {/* Student Info */}
                <div className="w-full flex-[2]">
                  <h2 className="text-lg sm:text-xl md:text-2xl lg:text-[1.3rem] mb-1 sm:mb-2 font-semibold text-slate-800">{student.name || "N/A"}</h2>
                  <div className="flex justify-center mb-3 sm:mb-4">
                    <span className="inline-block py-0.5 sm:py-1 px-2 sm:px-2.5 rounded-lg sm:rounded-[10px] text-xs sm:text-[0.8rem] font-semibold bg-green-100 text-green-700">
                      Active
                    </span>
                  </div>
                  <p className="my-0.5 sm:my-1 text-xs sm:text-sm md:text-[0.95rem] text-slate-700">
                    <strong className="text-slate-900">Date of Birth:</strong> {student.dateOfBirth || "N/A"}
                  </p>
                  <p className="my-0.5 sm:my-1 text-xs sm:text-sm md:text-[0.95rem] text-slate-700">
                    <strong className="text-slate-900">Register No:</strong> {student.registerNumber || "N/A"}
                  </p>
                  <p className="my-0.5 sm:my-1 text-xs sm:text-sm md:text-[0.95rem] text-slate-700">
                    <strong className="text-slate-900">Department:</strong> {student.department || "N/A"}
                  </p>
                  <p className="my-0.5 sm:my-1 text-xs sm:text-sm md:text-[0.95rem] text-slate-700 break-all">
                    <strong className="text-slate-900">Email:</strong> {student.email}
                  </p>
                  <p className="my-0.5 sm:my-1 text-xs sm:text-sm md:text-[0.95rem] text-slate-700">
                    <strong className="text-slate-900">Phone:</strong> {student.phoneNumber || "N/A"}
                  </p>
                </div>
              </div>
            ))}

            {filteredStudents.length === 0 && !loading && !error && (
              <p className="col-span-full text-center text-sm sm:text-base text-gray-500 py-8">No students found</p>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Popup */}
      {showConfirmPopup && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-4">
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg sm:rounded-xl shadow-[0_6px_20px_rgba(0,0,0,0.2)] w-full max-w-xs sm:max-w-sm">
            <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-slate-800">Confirm Deletion</h3>
            <p className="mb-4 sm:mb-5 text-xs sm:text-sm text-slate-700">
              Are you sure you want to delete{" "}
              <strong>{studentToDelete?.name}</strong>?
            </p>
            <div className="flex gap-2 sm:gap-3 justify-between">
              <button
                onClick={() => setShowConfirmPopup(false)}
                className="flex-1 py-2 sm:py-2.5 border-none rounded-lg text-xs sm:text-sm cursor-pointer font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2 sm:py-2.5 border-none rounded-lg text-xs sm:text-sm cursor-pointer font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reason Popup */}
      {showReasonPopup && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-4">
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg sm:rounded-xl shadow-[0_6px_20px_rgba(0,0,0,0.2)] w-full max-w-xs sm:max-w-sm">
            <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-slate-800">Reason for Deletion</h3>
            <textarea
              rows="4"
              placeholder="Enter reason..."
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 resize-none text-xs sm:text-sm mb-3 sm:mb-4 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            <div className="flex gap-2 sm:gap-3 justify-between">
              <button
                onClick={() => setShowReasonPopup(false)}
                className="flex-1 py-2 sm:py-2.5 border-none rounded-lg text-xs sm:text-sm cursor-pointer font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitReason}
                className="flex-1 py-2 sm:py-2.5 border-none rounded-lg text-xs sm:text-sm cursor-pointer font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
