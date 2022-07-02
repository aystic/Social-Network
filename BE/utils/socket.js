let io;
module.exports = {
  init: (server) => {
    io = require("socket.io")(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });
    io.on("connection", (connection) => {
      socket = connection;
      console.log("CLIENT CONNECTED!");
    });
  },
  getIO: () => {
    if (!io) {
      const error = new Error("No socket connection found!");
      error.statusCode = 500;
      throw error;
    }
    return io;
  },
};
