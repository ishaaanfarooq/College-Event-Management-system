import { useEffect, useState } from "react";
import API from "../api/axios";
import DashboardLayout from "../layouts/DashboardLayout";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);

  const fetchUsers = async () => {
    const res = await API.get("/admin/users");
    setUsers(res.data);
  };

  const fetchEvents = async () => {
    const res = await API.get("/events");
    setEvents(res.data);
  };

  useEffect(() => {
    fetchUsers();
    fetchEvents();
  }, []);

  const togglePermission = async (id) => {
    await API.patch(`/admin/permission/${id}`);
    fetchUsers();
  };

  const updateStatus = async (eventId, appId, status) => {
    const message =
      status === "accepted"
        ? "Congratulations! You have been selected."
        : "Sorry, you were not selected.";

    await API.patch(`/events/application/${eventId}/${appId}`, {
      status,
      message
    });

    fetchEvents();
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-12">
        <h2 className="text-3xl font-bold text-white">
          Admin Panel
        </h2>

        {/* ================= USERS SECTION ================= */}
        <div>
          <h3 className="text-xl font-semibold text-indigo-400 mb-4">
            User Permissions
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            {users.map((user) => (
              <div
                key={user._id}
                className="bg-gray-900 p-6 rounded-xl border border-gray-800"
              >
                <p className="text-white font-semibold">
                  {user.name}
                </p>
                <p className="text-gray-400 text-sm">
                  {user.email}
                </p>
                <p className="text-sm mt-2">
                  Role:{" "}
                  <span className="text-indigo-400">
                    {user.role}
                  </span>
                </p>

                {user.role !== "admin" && (
                  <button
                    onClick={() => togglePermission(user._id)}
                    className={`mt-4 px-4 py-2 rounded-lg text-sm ${
                      user.canCreateEvent
                        ? "bg-red-500 hover:bg-red-400"
                        : "bg-green-500 hover:bg-green-400"
                    }`}
                  >
                    {user.canCreateEvent
                      ? "Revoke Create Permission"
                      : "Grant Create Permission"}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ================= APPLICATIONS SECTION ================= */}
        <div>
          <h3 className="text-xl font-semibold text-indigo-400 mb-4">
            Event Applications
          </h3>

          {events.map((event) =>
            event.applications?.length > 0 ? (
              <div
                key={event._id}
                className="bg-gray-900 p-6 rounded-xl border border-gray-800 mb-6"
              >
                <h4 className="text-white font-semibold mb-4">
                  {event.title}
                </h4>

                {event.applications.map((app) => (
                  <div
                    key={app._id}
                    className="bg-gray-800 p-4 rounded-lg mb-3"
                  >
                    <p><strong>Name:</strong> {app.name}</p>
                    <p>Email: {app.email}</p>
                    <p>Phone: {app.phone}</p>
                    <p>USN: {app.usn}</p>

                    <p className="mt-2">
                      Status:{" "}
                      <span className={
                        app.status === "accepted"
                          ? "text-green-400"
                          : app.status === "rejected"
                          ? "text-red-400"
                          : "text-yellow-400"
                      }>
                        {app.status}
                      </span>
                    </p>

                    {app.status === "pending" && (
                      <div className="flex gap-3 mt-3">
                        <button
                          onClick={() =>
                            updateStatus(event._id, app._id, "accepted")
                          }
                          className="bg-green-600 px-3 py-1 rounded"
                        >
                          Accept
                        </button>

                        <button
                          onClick={() =>
                            updateStatus(event._id, app._id, "rejected")
                          }
                          className="bg-red-600 px-3 py-1 rounded"
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {app.message && (
                      <p className="text-xs text-gray-400 mt-2">
                        {app.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : null
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}