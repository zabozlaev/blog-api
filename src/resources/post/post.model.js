const mongoose = require("mongoose");

const { Schema } = require("mongoose");

const {
  Types: { ObjectId }
} = Schema;

const PostSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String
  },
  categories: [
    {
      type: String
    }
  ],
  author: {
    type: ObjectId,
    ref: "User"
  },
  comments: [
    {
      type: ObjectId,
      ref: "Comment"
    }
  ],
  likes: [
    {
      type: ObjectId,
      ref: "User",
      unique: true
    }
  ],
  createdDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Post", PostSchema);
