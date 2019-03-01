const mongoose = require("mongoose");

const { Schema } = require("mongoose");

const {
  Types: { ObjectId }
} = Schema;

const CommentSchema = new Schema({
  commentAuthor: {
    type: ObjectId,
    ref: "User",
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Comment", CommentSchema);
