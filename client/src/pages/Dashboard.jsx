import { useEffect, useState } from "react";
import API from "../api/axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [applyForm, setApplyForm] = useState({
    name: "",
    email: "",
    phone: "",
    usn: "",
  });

  const fetchEvents = async () => {
    const res = await API.get("/events");
    setEvents(res.data);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

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

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "All" || event.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-6 py-8">

        <h2 className="text-3xl font-bold mb-6 text-white">
          Welcome, {user?.name}
        </h2>

        {/* SEARCH + FILTER */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            placeholder="Search events..."
            className="flex-1 p-3 rounded-lg bg-gray-800 text-white border border-gray-700"
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="p-3 rounded-lg bg-gray-800 text-white border border-gray-700"
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Placement">Placement</option>
            <option value="Department">Department</option>
            <option value="Volunteer">Volunteer</option>
            <option value="Hackathon">Hackathon</option>
            <option value="Workshop">Workshop</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* EVENT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {

            const acceptedCount = event.applications.filter(
              (app) => app.status === "accepted"
            ).length;

            const isFull = acceptedCount >= event.maxCapacity;

            const isClosed =
              event.registrationDeadline &&
              new Date(event.registrationDeadline) < new Date();

            const isCreator =
              event.createdBy?._id === user._id;

            const existingApplication = event.applications.find(
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
                    📂 {event.category}
                  </p>

                  <p className="text-sm text-gray-500">
                    👥 {acceptedCount}/{event.maxCapacity}
                  </p>

                  <div className="mt-4 space-y-2">

                    {/* CREATOR */}
                    {isCreator && (
                      <span className="text-yellow-400 block">
                        You created this event
                      </span>
                    )}

                    {/* APPLICATION STATUS */}
                    {existingApplication && (
                      <div className="text-sm">
                        <span className="block">
                          Status:{" "}
                          <span
                            className={
                              existingApplication.status === "accepted"
                                ? "text-green-400"
                                : existingApplication.status === "rejected"
                                ? "text-red-400"
                                : "text-yellow-400"
                            }
                          >
                            {existingApplication.status}
                          </span>
                        </span>

                        {existingApplication.message && (
                          <p className="text-gray-400 mt-1">
                            Message: {existingApplication.message}
                          </p>
                        )}
                      </div>
                    )}

                    {/* APPLY BUTTON LOGIC */}
                    {!isCreator &&
                      !existingApplication &&
                      !isFull &&
                      !isClosed && (
                        <button
                          onClick={() => setSelectedEvent(event._id)}
                          className="bg-indigo-600 px-3 py-1 rounded hover:bg-indigo-500"
                        >
                          Apply
                        </button>
                      )}

                    {isFull && (
                      <span className="text-red-400 block">
                        Full
                      </span>
                    )}

                    {isClosed && (
                      <span className="text-gray-400 block">
                        Closed
                      </span>
                    )}

                    {/* APPLY FORM */}
                    {selectedEvent === event._id &&
                      !isCreator &&
                      !existingApplication && (
                        <div className="mt-4 space-y-2">
                          <input
                            placeholder="Name"
                            className="input"
                            onChange={(e) =>
                              setApplyForm({
                                ...applyForm,
                                name: e.target.value,
                              })
                            }
                          />
                          <input
                            placeholder="Email"
                            className="input"
                            onChange={(e) =>
                              setApplyForm({
                                ...applyForm,
                                email: e.target.value,
                              })
                            }
                          />
                          <input
                            placeholder="Phone"
                            className="input"
                            onChange={(e) =>
                              setApplyForm({
                                ...applyForm,
                                phone: e.target.value,
                              })
                            }
                          />
                          <input
                            placeholder="USN"
                            className="input"
                            onChange={(e) =>
                              setApplyForm({
                                ...applyForm,
                                usn: e.target.value,
                              })
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

                    {/* ADMIN DELETE */}
                    {user?.role === "admin" && (
                      <button
                        onClick={() =>
                          API.delete(`/events/${event._id}`).then(fetchEvents)
                        }
                        className="text-red-400 hover:underline block mt-2"
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