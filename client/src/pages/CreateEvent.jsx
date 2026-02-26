import { useState } from "react";
import API from "../api/axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";

export default function CreateEvent() {
  const navigate = useNavigate();

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
    await API.post("/events", form);
    navigate("/manage-events"); // redirect after create
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800">
          <h2 className="text-2xl font-bold text-indigo-400 mb-6">
            Create New Event
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid md:grid-cols-2 gap-4"
          >
            <input
              placeholder="Title"
              className="input"
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
            />

            <input
              type="date"
              className="input"
              onChange={(e) =>
                setForm({ ...form, date: e.target.value })
              }
            />

            <input
              placeholder="Location"
              className="input"
              onChange={(e) =>
                setForm({ ...form, location: e.target.value })
              }
            />

            <input
              placeholder="Category"
              className="input"
              onChange={(e) =>
                setForm({ ...form, category: e.target.value })
              }
            />

            <input
              placeholder="Image URL"
              className="input md:col-span-2"
              onChange={(e) =>
                setForm({ ...form, image: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Max Capacity"
              className="input"
              onChange={(e) =>
                setForm({
                  ...form,
                  maxCapacity: e.target.value,
                })
              }
            />

            <input
              type="date"
              className="input"
              onChange={(e) =>
                setForm({
                  ...form,
                  registrationDeadline: e.target.value,
                })
              }
            />

            <textarea
              placeholder="Description"
              className="input md:col-span-2"
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
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