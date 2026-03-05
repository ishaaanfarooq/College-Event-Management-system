let io;

module.exports = {
    init: (server) => {
        io = require("socket.io")(server, {
            cors: {
                origin: "*", // In production, restrict this to your frontend URL
                methods: ["GET", "POST", "PATCH", "DELETE"]
            }
        });

        io.on("connection", (socket) => {
            console.log("Client connected:", socket.id);

            socket.on("disconnect", () => {
                console.log("Client disconnected:", socket.id);
            });
        });

        return io;
    },
    getIO: () => {
        if (!io) {
            throw new Error("Socket.io not initialized!");
        }
        return io;
    }
};
