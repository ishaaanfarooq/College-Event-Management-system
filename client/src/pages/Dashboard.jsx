import { useEffect, useState } from "react";
import API from "../api/axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [applyForm, setApplyForm] = useState({
    name: "",
    email: "",
    phone: "",
    usn: "",
  });

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    category: "",
    image: "",
    maxCapacity: 100,
    registrationDeadline: "",
  });

  const fetchEvents = async () => {
    const res = await API.get("/events");
    setEvents(res.data);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // CREATE EVENT
  const createEvent = async (e) => {
    e.preventDefault();
    await API.post("/events", form);
    fetchEvents();
    setForm({
      title: "",
      description: "",
      date: "",
      location: "",
      category: "",
      image: "",
      maxCapacity: 100,
      registrationDeadline: "",
    });
  };

  // DELETE EVENT
  const deleteEvent = async (id) => {
    await API.delete(`/events/${id}`);
    fetchEvents();
  };

  // APPLY TO EVENT
  const applyToEvent = async (eventId) => {
    try {
      await API.post(`/events/apply/${eventId}`, applyForm);
      alert("Application submitted successfully");
      setSelectedEvent(null);
      setApplyForm({
        name: "",
        email: "",
        phone: "",
        usn: "",
      });
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || "Error applying");
    }
  };

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-6 py-8">

        <h2 className="text-3xl font-bold mb-6 text-white">
          Welcome, {user?.name}
        </h2>

        {/* SEARCH */}
        <input
          placeholder="Search events..."
          className="w-full mb-8 p-3 rounded-lg bg-gray-800 text-white border border-gray-700"
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* CREATE EVENT (ADMIN) */}
        {(user?.role === "admin" || user?.canCreateEvent) && (
          <div className="bg-gray-900 p-6 rounded-2xl shadow-xl mb-10 border border-gray-800">
            <h3 className="text-xl font-semibold mb-4 text-indigo-400">
              Create Event
            </h3>

            <form onSubmit={createEvent} className="grid md:grid-cols-2 gap-4">
              <input
                placeholder="Title"
                className="input"
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
              />

              <input
                type="date"
                className="input"
                value={form.date}
                onChange={(e) =>
                  setForm({ ...form, date: e.target.value })
                }
              />

              <input
                placeholder="Location"
                className="input"
                value={form.location}
                onChange={(e) =>
                  setForm({ ...form, location: e.target.value })
                }
              />

              <input
                placeholder="Category"
                className="input"
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
              />

              <input
                placeholder="Image URL"
                className="input md:col-span-2"
                value={form.image}
                onChange={(e) =>
                  setForm({ ...form, image: e.target.value })
                }
              />

              <input
                type="number"
                placeholder="Max Capacity"
                className="input"
                value={form.maxCapacity}
                onChange={(e) =>
                  setForm({ ...form, maxCapacity: e.target.value })
                }
              />

              <input
                type="date"
                className="input"
                value={form.registrationDeadline}
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
                value={form.description}
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
        )}

        {/* EVENT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const isFull =
              event.applications.length >= event.maxCapacity;

            const isClosed =
              event.registrationDeadline &&
              new Date(event.registrationDeadline) < new Date();

            const alreadyApplied = event.applications.some(
              (app) => app.user?._id === user._id
            );

            return (
              <div
                key={event._id}
                className="bg-gray-900 rounded-2xl shadow-lg overflow-hidden border border-gray-800"
              >
                {event.image && (
                  <img
                    src={event.image}
                    alt={event.title}
                    className="h-48 w-full object-cover"
                  />
                )}

                <div className="p-6 text-white">
                  <h3 className="text-xl font-bold mb-2">
                    {event.title}
                  </h3>

                  <p className="text-gray-400 mb-2">
                    {event.description}
                  </p>

                  <p className="text-sm text-gray-500">
                    📍 {event.location}
                  </p>

                  <p className="text-sm text-gray-500">
                    👥 {event.applications.length}/{event.maxCapacity}
                  </p>

                  <div className="mt-4">

                    {alreadyApplied ? (
                      <span className="text-green-400">
                        Applied
                      </span>
                    ) : isFull ? (
                      <span className="text-red-400">
                        Full
                      </span>
                    ) : isClosed ? (
                      <span className="text-gray-400">
                        Closed
                      </span>
                    ) : (
                      <button
                        onClick={() => setSelectedEvent(event._id)}
                        className="bg-indigo-600 px-3 py-1 rounded hover:bg-indigo-500"
                      >
                        Apply
                      </button>
                    )}

                    {/* APPLY FORM */}
                    {selectedEvent === event._id && (
                      <div className="mt-4 space-y-2">
                        <input
                          placeholder="Name"
                          className="input"
                          onChange={(e) =>
                            setApplyForm({ ...applyForm, name: e.target.value })
                          }
                        />
                        <input
                          placeholder="Email"
                          className="input"
                          onChange={(e) =>
                            setApplyForm({ ...applyForm, email: e.target.value })
                          }
                        />
                        <input
                          placeholder="Phone"
                          className="input"
                          onChange={(e) =>
                            setApplyForm({ ...applyForm, phone: e.target.value })
                          }
                        />
                        <input
                          placeholder="USN"
                          className="input"
                          onChange={(e) =>
                            setApplyForm({ ...applyForm, usn: e.target.value })
                          }
                        />
                        <button
                          onClick={() => applyToEvent(event._id)}
                          className="bg-green-600 px-3 py-1 rounded w-full"
                        >
                          Submit Application
                        </button>
                      </div>
                    )}

                    {user?.role === "admin" && (
                      <button
                        onClick={() => deleteEvent(event._id)}
                        className="text-red-400 hover:underline ml-4"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}