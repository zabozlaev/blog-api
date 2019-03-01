const { app } = require("./server.js");

module.exports = require("socket.io")(app);
