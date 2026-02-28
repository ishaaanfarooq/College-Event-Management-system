import { useState } from "react";
import API from "../api/axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";

export default function CreateEvent() {
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    category: "",
    image: "",
    maxCapacity: 50,
    registrationDeadline: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/events", form);
      navigate("/manage-events");
    } catch (err) {
      alert(err.response?.data?.message || "Error creating event");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800">
          <h2 className="text-2xl font-bold text-indigo-400 mb-6">
            Create New Event
          </h2>

          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">

            <input
              required
              placeholder="Title"
              className="input"
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            <input
              type="date"
              required
              min={today}
              className="input"
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />

            <input
              required
              placeholder="Location"
              className="input"
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />

            <select
              required
              className="input"
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="">Select Category</option>
              <option value="Placement">Placement</option>
              <option value="Department">Department</option>
              <option value="Volunteer">Volunteer</option>
              <option value="Hackathon">Hackathon</option>
              <option value="Workshop">Workshop</option>
              <option value="Other">Other</option>
            </select>

            <input
              placeholder="Image URL"
              className="input md:col-span-2"
              onChange={(e) => setForm({ ...form, image: e.target.value })}
            />

            <input
              type="number"
              required
              min="1"
              placeholder="Max Capacity"
              className="input"
              onChange={(e) => setForm({ ...form, maxCapacity: e.target.value })}
            />

            <input
              type="date"
              required
              min={today}
              className="input"
              onChange={(e) =>
                setForm({ ...form, registrationDeadline: e.target.value })
              }
            />

            <textarea
              required
              placeholder="Description"
              className="input md:col-span-2"
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            <button className="bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg md:col-span-2 transition">
              Create Event
            </button>

          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}