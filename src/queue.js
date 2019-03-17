

const Queue = require("bull");

const MailQueue = new Queue("email");

module.exports = {
  MailQueue
};
