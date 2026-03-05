import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        // Determine backend URL (usually same as API base)
        const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

        const newSocket = io(socketUrl, {
            transports: ["websocket"],
            autoConnect: true,
        });

        setSocket(newSocket);

        newSocket.on("connect", () => {
            console.log("Socket connected:", newSocket.id);
        });

        // Listen for global relevant events to show toasts
        newSocket.on("new_application", (data) => {
            if (user && user._id === data.creatorId) {
                toast.info(`New application for "${data.eventTitle}"!`, {
                    icon: "📨",
                    position: "top-right"
                });
            }
        });

        newSocket.on("application_status_update", (data) => {
            if (user && user._id === data.userId) {
                toast.success(`Your application for "${data.eventTitle}" was ${data.status}!`, {
                    icon: data.status === "accepted" ? "✅" : "❌",
                    position: "top-right"
                });
            }
        });

        newSocket.on("event_status_update", (data) => {
            if (user && user._id === data.creatorId) {
                toast.info(`Your event "${data.eventTitle}" has been ${data.status} by an admin.`, {
                    icon: data.status === "published" ? "🚀" : "⚠️",
                    position: "top-right"
                });
            }
        });

        return () => newSocket.close();
    }, [user]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
