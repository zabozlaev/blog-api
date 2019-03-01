const nodemailer = require("nodemailer");

const sendGridTransporter = require("nodemailer-sendgrid-transport");

const {
  auth: { api_key }
} = require("../config");

module.exports = nodemailer.createTransport(
  sendGridTransporter({
    auth: {
      api_key
    }
  })
);
