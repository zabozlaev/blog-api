const mongoose = require("mongoose");

const { dbUri } = require("../config");

module.exports = (options = {}, url = dbUri) =>
  mongoose.connect(url, { ...options, useNewUrlParser: true });
