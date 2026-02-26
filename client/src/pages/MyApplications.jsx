import { useEffect, useState } from "react";
import API from "../api/axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";

export default function MyApplications() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    const res = await API.get("/events");

    const appliedEvents = res.data.filter(event =>
      event.applications.some(app =>
        app.user?._id === user._id
      )
    );

    setEvents(appliedEvents);
  };

  return (
    <DashboardLayout>
      <h2 className="text-3xl font-bold mb-6">
        My Applications ({events.length})
      </h2>

      <div className="space-y-6">
        {events.map(event => {
          const app = event.applications.find(
            a => a.user?._id === user._id
          );

          return (
            <div key={event._id} className="bg-gray-900 p-6 rounded-xl">
              <h3 className="text-xl font-bold">{event.title}</h3>

              <p>
                Status:
                <span className={
                  app.status === "accepted"
                    ? " text-green-400"
                    : app.status === "rejected"
                    ? " text-red-400"
                    : " text-yellow-400"
                }>
                  {" "}{app.status}
                </span>
              </p>

              {app.message && (
                <p className="mt-2 text-gray-400">
                  {app.message}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}