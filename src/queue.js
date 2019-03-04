// const kue = require("kue");

// const queue = kue.createQueue();

// process.once("SIGTERM", sig => {
//   queue.shutdown(5000, err => {
//     console.log("Kue shutdown: ", err || "");
//     process.exit(0);
//   });
// });

// module.exports = queue;

const Queue = require("bull");

const MailQueue = new Queue("email");

module.exports = {
  MailQueue
};
