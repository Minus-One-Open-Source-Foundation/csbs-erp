import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import ApprovalCard from "./ApprovalCard";

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ q: "", type: "all", dept: "all" });

  // Default demo activities
  const defaultActivities = [
    {
      id: 1,
      title: "Hackathon",
      description: "Participated in SIH Hackathon",
      category: "Competition",
      status: "Pending",
      student: "John Doe",
      dept: "cse"
    },
    {
      id: 2,
      title: "Workshop",
      description: "Attended AI Workshop",
      category: "Workshop",
      status: "Pending",
      student: "Jane Smith",
      dept: "ece"
    },
    {
      id: 3,
      title: "Paper Presentation",
      description: "Presented paper at National Conference",
      category: "Academic",
      status: "Pending",
      student: "Rahul Kumar",
      dept: "cse"
    },
    {
      id: 4,
      title: "Sports Meet",
      description: "Participated in Intercollege Sports Meet",
      category: "Extracurricular",
      status: "Pending",
      student: "Priya Singh",
      dept: "ece"
    }
  ];

  const [activities, setActivities] = useState(defaultActivities);

  // Only use demo data, no API
  function fetchPending() {
    setLoading(true);
    setError("");
    setActivities(defaultActivities);
    setLoading(false);
  }

  useEffect(() => {
    fetchPending();
    // eslint-disable-next-line
  }, []);

  function removeActivityFromList(id) {
    setActivities((prev) => prev.filter((a) => (a.id ?? a._id) !== id));
  }

  return (
    <div className="max-w-[1280px] mx-auto p-10 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Faculty Approval Dashboard
      </h1>
      <p className="text-base text-gray-500 mb-6">
        Signed in as: <span>{user?.email}</span>
      </p>

      {/* Controls Section */}
      <section className="w-full max-w-[920px] mx-auto mb-10 text-left">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6 items-center">
          <div
            className="rounded-lg p-4 text-center text-white shadow-[0_4px_10px_rgba(0,0,0,0.15)] transition-[transform,box-shadow] duration-200 w-[200px] h-[200px]"
            style={{ background: "linear-gradient(to right, #4e54c8, #8f94fb, #4e54c8)" }}
          >
            <h3 className="text-2xl mb-3">Search</h3>
            <input
              type="text"
              placeholder="Student or Title"
              value={filters.q}
              onChange={e => setFilters(f => ({ ...f, q: e.target.value }))}
              className="w-full p-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 mb-2.5 outline-none text-lg font-[inherit] shadow-[0_2px_6px_rgba(78,84,200,0.1)] transition-[border-color] duration-200"
            />
          </div>
          <div
            className="rounded-lg p-4 text-center text-white shadow-[0_4px_10px_rgba(0,0,0,0.15)] transition-[transform,box-shadow] duration-200 w-[200px] h-[200px]"
            style={{ background: "linear-gradient(to right, #4e54c8, #8f94fb, #4e54c8)" }}
          >
            <h3 className="text-2xl mb-3">Type</h3>
            <select
              value={filters.type}
              onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}
              className="w-full p-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 mb-2.5 outline-none text-lg font-[inherit] shadow-[0_2px_6px_rgba(78,84,200,0.1)] transition-[border-color] duration-200"
            >
              <option value="all">All Types</option>
              <option value="academic">Academic</option>
              <option value="co-curricular">Co-curricular</option>
              <option value="extracurricular">Extracurricular</option>
            </select>
          </div>
          <div
            className="rounded-lg p-4 text-center text-white shadow-[0_4px_10px_rgba(0,0,0,0.15)] transition-[transform,box-shadow] duration-200 w-[200px] h-[200px]"
            style={{ background: "linear-gradient(to right, #4e54c8, #8f94fb, #4e54c8)" }}
          >
            <h3 className="text-2xl mb-3">Department</h3>
            <select
              value={filters.dept}
              onChange={e => setFilters(f => ({ ...f, dept: e.target.value }))}
              className="w-full p-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 mb-2.5 outline-none text-lg font-[inherit] shadow-[0_2px_6px_rgba(78,84,200,0.1)] transition-[border-color] duration-200"
            >
              <option value="all">All Departments</option>
              <option value="cse">CSE</option>
              <option value="ece">ECE</option>
            </select>
          </div>
          <div
            className="rounded-lg p-4 text-center text-white shadow-[0_4px_10px_rgba(0,0,0,0.15)] transition-[transform,box-shadow] duration-200 flex flex-col justify-center items-center w-[200px] h-[200px]"
            style={{ background: "linear-gradient(to right, #4e54c8, #8f94fb, #4e54c8)" }}
          >
            <button
              className="border-none p-2.5 px-4 rounded-lg text-white font-bold cursor-pointer text-lg shadow-[0_4px_10px_rgba(78,84,200,0.15)] transition-transform duration-150 hover:-translate-y-0.5"
              style={{ background: "linear-gradient(90deg, #4e54c8, #8f94fb)" }}
              onClick={fetchPending}
            >
              Refresh
            </button>
            <button
              className="mt-2.5 bg-transparent text-[#4e54c8] border-none underline cursor-pointer font-semibold text-lg"
              onClick={() => { setFilters({ q: "", type: "all", dept: "all" }); fetchPending(); }}
            >
              Clear
            </button>
          </div>
        </div>
      </section>

      {/* Approvals Section */}
      <section className="w-full max-w-[920px] mx-auto text-left">
        <div className="mb-4">
          <h2 className="text-xl font-bold">Pending Activities</h2>
        </div>
        {loading ? (
          <div className="flex justify-center mt-8">
            <span>Loading...</span>
          </div>
        ) : activities.length === 0 ? (
          <div className="mt-4 text-indigo-500 font-semibold">No pending activities.</div>
        ) : (
          <div className="bg-[#f4f4f4] rounded-xl p-6 max-h-[360px] overflow-y-auto shadow-[0_4px_15px_rgba(0,0,0,0.08)]">
            <ul className="list-none p-0 m-0">
              {activities.map((act) => {
                const id = act.id ?? act._id;
                return (
                  <li key={id} className="bg-[#eaeaea] p-4 mb-2.5 rounded-lg relative">
                    <ApprovalCard
                      activity={act}
                      onApprove={() => removeActivityFromList(id)}
                      onReject={() => removeActivityFromList(id)}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}