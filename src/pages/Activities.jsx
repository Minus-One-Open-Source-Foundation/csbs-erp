import React, { useState } from "react";
import bgImage from "../assets/bg.jpg";

export default function Activities() {
  const [activities, setActivities] = useState([]);
  const [activity, setActivity] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    description: "",
    file: null,
  });

  const addActivity = () => {
    if (formData.title.trim()) {
      setActivities([{ ...formData, id: Date.now() }, ...activities]);
      setFormData({ title: "", date: "", description: "", file: null });
      setShowForm(false);
    }
  };

  const removeActivity = (id) => {
    setActivities(activities.filter((act) => act.id !== id));
  };

  return (
    <div
      className="min-h-screen py-12 px-8 bg-cover bg-center bg-fixed font-sans text-gray-800 max-sm:px-3 max-sm:py-6"
      style={{ backgroundImage: `url('${bgImage}')` }}
    >
      <header className="text-center mb-8">
        <h1 className="text-2xl font-bold text-black mb-2">Certifications</h1>
        <p className="text-base text-gray-500">Add and track all your activities</p>
      </header>

      {/* Search + Filters + Add Button */}
      <section className="flex gap-4 flex-wrap justify-center mb-8 max-sm:flex-col max-sm:gap-3">
        <input
          type="text"
          placeholder="Search activity..."
          value={activity}
          onChange={(e) => setActivity(e.target.value)}
          className="flex-[0.5] min-w-[220px] py-3 px-4 rounded-[14px] border border-gray-300 outline-none text-base shadow-[0_2px_8px_rgba(0,0,0,0.05)] focus:shadow-[0_0_10px_rgba(100,100,255,0.2)] max-sm:min-w-0 max-sm:w-full"
        />
        <div className="w-full flex flex-col items-stretch">
          <div className="flex flex-row gap-[1.2rem] items-center mt-[0.7rem] flex-wrap justify-center">
            <div className="flex gap-4 max-sm:gap-2 max-sm:flex-wrap">
              {["All", "Academic-Courses", "Non-Academics"].map((f) => (
                <button
                  key={f}
                  className={`py-[13px] px-5 rounded-xl border-none cursor-pointer text-white font-bold text-base shadow-[0_8px_26px_rgba(238,9,121,0.13)] transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(238,9,121,0.18)] ${selectedFilter === f ? "opacity-100" : "opacity-80"
                    }`}
                  style={{ background: "linear-gradient(90deg, #ff6a00, #ee0979)" }}
                  onClick={() => setSelectedFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
            <button
              className="py-3 px-6 border-none text-white font-semibold text-base rounded-2xl cursor-pointer shadow-[0_8px_26px_rgba(238,9,121,0.13)] transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(238,9,121,0.18)]"
              style={{ background: "linear-gradient(90deg, #ff6a00, #ee0979)" }}
              onClick={() => setShowForm(true)}
            >
              Add Activity
            </button>
          </div>
        </div>
      </section>

      {/* Modal Form */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/50 flex justify-center items-start pt-20 z-[1000] max-sm:pt-10"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-[#f0f7ff] pt-8 px-8 pb-8 rounded-2xl w-[450px] flex flex-col gap-4 shadow-[0_12px_30px_rgba(0,0,0,0.2)] animate-fade-in border border-[#c8e1ff] max-sm:max-w-[85vw] max-sm:w-full max-sm:px-5 max-sm:py-6 max-sm:gap-3 overflow-y-auto max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="m-0 mb-2 text-[1.3rem] max-sm:text-[1.1rem] text-[#1a3c6e]">Add New Activity</h2>
            <label className="text-sm max-sm:text-xs font-semibold text-[#1a3c6e]">Select Category</label>
            <select
              className="py-2.5 px-3 rounded-xl border border-gray-300"
              onChange={(e) => console.log(e.target.value)}
            >
              <option value="academic-courses">Academic-Courses</option>
              <option value="non-academics">Non-Academics</option>
            </select>
            <label className="text-sm max-sm:text-xs font-semibold text-[#1a3c6e]">Title</label>
            <input
              type="text"
              placeholder="Enter Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full py-3 px-3 border border-[#aac9f0] rounded-[10px] text-base bg-white"
            />
            <label className="text-sm font-semibold text-[#1a3c6e]">Date of Completion</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="w-full py-3 px-3 border border-[#aac9f0] rounded-[10px] text-base bg-white"
            />
            <label className="text-sm max-sm:text-xs font-semibold text-[#1a3c6e]">Description</label>
            <textarea
              placeholder="Enter Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full py-3 px-3 border border-[#aac9f0] rounded-[10px] text-base bg-white min-h-[60px] resize-none"
            />
            <div className="w-full border border-[#aac9f0] rounded-[10px] p-4 bg-white">
              <label className="flex items-center cursor-pointer">
                <input
                  type="file"
                  accept="image/jpeg, image/png, image/jpg"
                  className="hidden"
                  id="fileInput"
                  onChange={(e) =>
                    setFormData({ ...formData, file: e.target.files[0] })
                  }
                />
                <button
                  type="button"
                  className="px-4 py-2.5 border border-gray-400 rounded-lg text-gray-700 font-semibold cursor-pointer hover:bg-gray-50"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("fileInput").click();
                  }}
                >
                  Choose File
                </button>
                <span className="ml-3 text-gray-500">{formData.file ? formData.file.name : "No file chosen"}</span>
              </label>
              <p className="text-sm text-gray-500 mt-2">Allowed formats: jpg, jpeg, png</p>
            </div>
            <div className="flex justify-end gap-4 mt-2">
              <button
                onClick={addActivity}
                className="py-2.5 px-5 border-none rounded-lg font-semibold cursor-pointer text-white"
                style={{ background: "linear-gradient(90deg, #6a11cb, #2575fc)" }}
              >
                Submit
              </button>
              <button
                className="py-2.5 px-5 border-none rounded-lg font-semibold cursor-pointer bg-[#e3eaf7] text-gray-800"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activities List */}
      <section className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6 max-[480px]:grid-cols-1">
        {activities.length === 0 ? (
          <div className="text-center text-base text-gray-400 col-span-full">No activities added yet.</div>
        ) : (
          activities.map((act) => (
            <div
              key={act.id}
              className="bg-[#f9f9f9] rounded-2xl py-4 px-6 flex flex-col gap-2 font-medium transition-[transform,box-shadow] duration-[250ms] hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(0,0,0,0.1)]"
            >
              <div>
                <strong>{act.title}</strong>
                <p>{act.date}</p>
                <small>{act.description}</small>
              </div>
              <button
                onClick={() => removeActivity(act.id)}
                className="bg-none border-none text-[#ff4b5c] cursor-pointer text-[1.1rem] self-end"
              >
                ❌
              </button>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
