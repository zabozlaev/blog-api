const [User, Post, Comment] = require("./models");

const respond = require("../../utils/respond");

const socket = require("../../socket");

const USER_POPULATE_ARGS =
  "-password -email -canReset -resetToken -expirationDate";

module.exports = {
  async deleteComment(req, res) {
    try {
      const { commentId } = req.params;

      const { postId } = await Post.findByIdAndRemove(commentId);

      res
        .send({
          ...respond(true, "Successfuly removed a comment.")
        })
        .end();
      socket.emit(`comment`, {
        action: "removed",
        postId,
        commentId: commentId
      });
    } catch (error) {
      return res
        .status(403)
        .send({
          ...respond(false, "You have no permisson to access this resource.")
        })
        .end();
    }
  },
  async deletePost() {
    try {
      const { postId } = req.params;

      const post = await Post.findByIdAndRemove(commentId);

      await Comment.findOneAndRemove({ postId });

      res
        .send({
          ...respond(true, "Successfuly removed a post.")
        })
        .end();
      socket.emit(`post`, {
        action: "removed",
        postId
      });
    } catch (error) {
      return res
        .status(403)
        .send({
          ...respond(false, "You have no permisson to access this resource.")
        })
        .end();
    }
  },
  async banUser() {
    try {
      const { userId } = req.params;

      const userBanned = User.findByIdAndUpdate(userId, {
        isBanned: true
      });

      socket.emit("user", {
        action: "ban",
        userBanned
      });

      return res
        .send({
          userBanned,
          ...respond(true, `You've banned a user, ${req.user.username}`)
        })
        .end();
    } catch (error) {
      return res
        .status(403)
        .send({
          ...respond(false, "You have no permisson to access this resource.")
        })
        .end();
    }
  },
  async createPost() {
    try {
      const { _id } = req.user;

      const { title, text, imageUrl, categories } = req.body;

      const newPost = new Post({
        title,
        text,
        imageUrl,
        categories,
        author: _id
      });

      await newPost.save();

      const post = await newPost.populate("author", USER_POPULATE_ARGS);

      res
        .send({
          ...respond(true, "Successfuly removed a post."),
          post
        })
        .end();
      socket.emit(`post`, {
        action: "created",
        post
      });
    } catch (error) {
      return res
        .status(403)
        .send({
          ...respond(false, "You have no permisson to access this resource.")
        })
        .end();
    }
  }
};
