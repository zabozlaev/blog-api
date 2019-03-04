const { hasPermisson } = require("./utils/auth");
let io;
const { verifyToken } = require("./utils/auth");

const ADMIN_ROOM = `adminChannel`;

module.exports = {
  init(httpServer) {
    io = require("socket.io")(httpServer);

    io.of("/admin").use(async (socket, next) => {
      const bearer = socket.handshake.query.token;

      const token = bearer.split("Bearer ")[1].trim();

      console.log(token);

      const { id, role } = await verifyToken(token);
      if (role !== "admin") {
        socket.of("/admin").emit("admin", "No auth");
        next(new Error("Authentication error"));
      } else {
        socket.join(ADMIN_ROOM);
        io.to(ADMIN_ROOM).emit("admin", "hello");
        next();
      }
    });

    return io;
  },
  getIO() {
    return io;
  },
  ADMIN_ROOM
};
