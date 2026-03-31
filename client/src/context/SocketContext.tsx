import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        // Determine backend URL (usually same as API base)
        const socketUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

        const newSocket = io(socketUrl, {
            transports: ["websocket"],
            autoConnect: true,
        });

        setSocket(newSocket);

        newSocket.on("connect", () => {
            console.log("Socket connected:", newSocket.id);
        });

        // Listen for global relevant events to show toasts
        newSocket.on("new_application", (data: any) => {
            if (user && user._id === data.creatorId) {
                toast.info(`New application for "${data.eventTitle}"!`, {
                    icon: "📨" as any,
                    position: "top-right"
                });
            }
        });

        newSocket.on("application_status_update", (data: any) => {
            if (user && user._id === data.userId) {
                toast.success(`Your application for "${data.eventTitle}" was ${data.status}!`, {
                    icon: (data.status === "accepted" ? "✅" : "❌") as any,
                    position: "top-right"
                });
            }
        });

        newSocket.on("event_status_update", (data: any) => {
            if (user && user._id === data.creatorId) {
                toast.info(`Your event "${data.eventTitle}" has been ${data.status} by an admin.`, {
                    icon: (data.status === "published" ? "🚀" : "⚠️") as any,
                    position: "top-right"
                });
            }
        });

        return () => { newSocket.close(); };
    }, [user]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
