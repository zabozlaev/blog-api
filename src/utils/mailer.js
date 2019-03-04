const nodemailer = require("nodemailer");

const sendGridTransporter = require("nodemailer-sendgrid-transport");

const { MailQueue } = require("../queue");

const User = require("../resources/user/user.model");

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

const email = async data => {
  return await transport.sendMail(data);
};

const notifyAll = async postId => {
  const allEmails = await User.find({}).select("email");

  allEmails.forEach(({ email }) => {
    const sendFields = {
      to: email,
      from: "ilya@zabcode.com",
      subject: "Here is a new post!",
      html: `
      <h1>Hey.</h1> We've got a new post for you: ...link/${postId}
    `
    };

    MailQueue.add(sendFields);
  });
};

MailQueue.process(async job => {
  const { data } = job;

  return await email(data);
});

module.exports = { MailQueue, notifyAll };
