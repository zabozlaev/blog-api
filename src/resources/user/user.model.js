const mongoose = require("mongoose");
const { Schema } = mongoose;

const md5 = require("md5");
const bcrypt = require("bcrypt");

const SALT = 10;

const roles = {
  member: "user",
  admin: "admin"
};

const UserSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  username: {
    type: String
  },
  password: {
    type: String,
    required: true
  },
  resetToken: {
    type: String
  },
  expirationDate: {
    type: Date
  },
  canReset: {
    type: Boolean,
    default: false
  },
  avatarUrl: {
    type: String
  },
  role: {
    type: String,
    required: true,
    default: roles.member
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  liked: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post"
    }
  ],
  ownPosts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post"
    }
  ]
});

UserSchema.pre("save", function(next) {
  this.username = this.get("email");

  if (!this.isModified("avatarUrl")) {
    return next();
  }

  this.avatarUrl = `http://gravatar.com/avatar/${md5(
    this.email.split("@")[0]
  )}?d=identicon`;
  next();
});

UserSchema.pre("save", function(next) {
  const user = this;
  if (!user.isModified("password")) {
    return next();
  }
  bcrypt.genSalt(SALT, (err, salt) => {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

UserSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", UserSchema);

module.exports.roles = roles;
