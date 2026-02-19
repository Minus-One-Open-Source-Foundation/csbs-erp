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
    <div className="p-8 font-sans w-full max-w-full m-0 max-sm:p-4">
      <header className="text-center mb-8">
        <h1 className="text-[2.3rem] font-bold text-slate-800 max-sm:text-[1.6rem]">Student Management</h1>
        <p className="text-slate-500">Manage student details and profiles</p>
      </header>

      {/* Search Bar */}
      <div className="flex justify-center mb-6">
        <div className="relative w-[90%]">
          <FaSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400 text-[1.1rem]" />
          <input
            type="text"
            placeholder="Search by name or register number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-4 pr-6 pl-12 rounded-xl border border-gray-300 text-[1.05rem] shadow-[0_4px_12px_rgba(0,0,0,0.05)] outline-none transition-all duration-300 focus:border-blue-500 focus:shadow-[0_4px_12px_rgba(59,130,246,0.3)]"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-l-blue-500 rounded-full animate-spin mb-4"></div>
          <p>Loading students...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <p className="text-red-600 mb-4 text-[1.1rem]">{error}</p>
          <button
            onClick={loadAllProfiles}
            className="bg-blue-500 text-white border-none py-3 px-6 rounded-lg cursor-pointer text-base font-semibold transition-colors duration-200 hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      )}

      {/* Student Grid */}
      {!loading && !error && (
        <div className="max-h-[75vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-thumb-rounded-lg hover:scrollbar-thumb-slate-400">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 w-full">
            {filteredStudents.map((student) => (
              <div
                className="relative flex justify-start items-start bg-white rounded-xl p-8 shadow-[0_6px_20px_rgba(0,0,0,0.1)] transition-all duration-300 w-full hover:-translate-y-[3px] hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] max-md:flex-col max-md:text-center"
                key={student.email}
              >
                {/* Delete Button */}
                <button
                  className="absolute top-2.5 right-2.5 w-[1cm] h-[1cm] flex items-center justify-center border-none rounded bg-red-400 text-white cursor-pointer text-base hover:bg-red-600"
                  onClick={() => handleDeleteClick(student)}
                >
                  <FaTrash />
                </button>

                {/* Profile Photo */}
                <div className="flex flex-col items-center justify-center ml-[1cm] mt-[1cm] max-md:ml-0 max-md:mt-0 max-md:mb-4">
                  <div className="w-40 h-40 rounded-full overflow-hidden border-[3px] border-gray-300 shadow-[0_6px_18px_rgba(0,0,0,0.2)] flex items-center justify-center max-md:w-[140px] max-md:h-[140px] group">
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
                <div className="flex-[2] ml-[1.5cm] max-md:ml-0">
                  <h2 className="text-[1.3rem] mb-1.5 relative -top-1">{student.name || "N/A"}</h2>
                  <p className="my-1 text-[0.95rem]">
                    <strong>Date of Birth:</strong> {student.dateOfBirth || "N/A"}
                  </p>
                  <p className="my-1 text-[0.95rem]">
                    <strong>Register No:</strong> {student.registerNumber || "N/A"}
                  </p>
                  <p className="my-1 text-[0.95rem]">
                    <strong>Department:</strong> {student.department || "N/A"}
                  </p>
                  <p className="my-1 text-[0.95rem]">
                    <strong>Email:</strong> {student.email}
                  </p>
                  <p className="my-1 text-[0.95rem]">
                    <strong>Phone:</strong> {student.phoneNumber || "N/A"}
                  </p>
                  <span className="inline-block mt-1.5 py-1 px-2.5 rounded-[10px] text-[0.8rem] font-semibold bg-green-100 text-green-700">
                    Active
                  </span>
                </div>
              </div>
            ))}

            {filteredStudents.length === 0 && !loading && !error && (
              <p className="text-center text-base text-gray-500">No students found</p>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Popup */}
      {showConfirmPopup && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000]">
          <div className="bg-white p-8 rounded-xl shadow-[0_6px_20px_rgba(0,0,0,0.2)] max-w-[400px] w-full text-center max-sm:max-w-[90vw] max-sm:mx-4 max-sm:p-5">
            <h3 className="mb-4">Confirm Deletion</h3>
            <p className="mb-5">
              Are you sure you want to delete{" "}
              <strong>{studentToDelete?.name}</strong>?
            </p>
            <div className="flex justify-between">
              <button
                onClick={() => setShowConfirmPopup(false)}
                className="flex-1 mx-1 py-2.5 border-none rounded-lg text-[0.95rem] cursor-pointer font-semibold bg-gray-200 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 mx-1 py-2.5 border-none rounded-lg text-[0.95rem] cursor-pointer font-semibold bg-red-500 text-white"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reason Popup */}
      {showReasonPopup && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000]">
          <div className="bg-white p-8 rounded-xl shadow-[0_6px_20px_rgba(0,0,0,0.2)] max-w-[400px] w-full text-center max-sm:max-w-[90vw] max-sm:mx-4 max-sm:p-5">
            <h3 className="mb-4">Reason for Deletion</h3>
            <textarea
              rows="4"
              placeholder="Enter reason..."
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 resize-none text-[0.95rem] mb-4"
            />
            <div className="flex justify-between">
              <button
                onClick={() => setShowReasonPopup(false)}
                className="flex-1 mx-1 py-2.5 border-none rounded-lg text-[0.95rem] cursor-pointer font-semibold bg-gray-200 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={submitReason}
                className="flex-1 mx-1 py-2.5 border-none rounded-lg text-[0.95rem] cursor-pointer font-semibold bg-red-500 text-white"
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
