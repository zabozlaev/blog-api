const nodemailer = require("nodemailer");

const sendGridTransporter = require("nodemailer-sendgrid-transport");

const queue = require("../queue");

const {
  auth: { api_key }
} = require("../config");

const transport = nodemailer.createTransport(
  sendGridTransporter({
    auth: {
      api_key
    }
  })
);

const email = async (data, done) => {
  try {
    await transport.sendMail(data);
    done();
  } catch (error) {
    return done(error);
  }
};

queue.process("email", (job, done) => {
  const { data } = job;
  email(data, done);
});

module.exports = transport;
