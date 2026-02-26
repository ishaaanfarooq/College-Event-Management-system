import { useEffect, useState } from "react";
import API from "../api/axios";
import DashboardLayout from "../layouts/DashboardLayout";

export default function ManageEvents() {
  const [events, setEvents] = useState([]);

  const fetchEvents = async () => {
    const res = await API.get("/events");
    setEvents(res.data);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const deleteEvent = async (id) => {
    await API.delete(`/events/${id}`);
    fetchEvents();
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-indigo-400 mb-6">
          Manage Events
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event._id}
              className="bg-gray-900 p-6 rounded-xl border border-gray-800"
            >
              {event.image && (
                <img
                  src={event.image}
                  className="h-40 w-full object-cover rounded mb-4"
                />
              )}

              <h3 className="text-white font-bold">
                {event.title}
              </h3>

              <p className="text-gray-400 text-sm mb-2">
                {event.location}
              </p>

              <p className="text-gray-500 text-sm">
                👥 {event.applications?.length || 0}/
                {event.maxCapacity}
              </p>

              <button
                onClick={() =>
                  deleteEvent(event._id)
                }
                className="mt-4 bg-red-500 hover:bg-red-400 px-3 py-1 rounded text-sm"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}