const Post = require("./post.model");
const User = require("../user/user.model");

const Comment = require("./comment/comment.model");

const USER_POPULATE_ARGS =
  "-password -email -canReset -resetToken -expirationDate";

const socket = require("../../socket.js");

const respond = require("../../utils/respond");

module.exports = {
  async showAll(req, res) {
    const { page } = req.query || 1;

    const postLimit = 5;

    try {
      const totalPosts = await Post.countDocuments();
      const posts = await Post.find({})
        .skip((page - 1) * postLimit)
        .limit(postLimit)
        .sort({ createdDate: -1 })
        .populate("author", USER_POPULATE_ARGS)
        .populate({
          path: "comments",
          populate: { path: "commentAuthor", select: USER_POPULATE_ARGS }
        });

      res.status(200).send({
        posts,
        totalPosts,
        ...respond(false, "Posts loaded.")
      });
    } catch (e) {
      res.status(500).send({
        ...respond(false, "Internal Server Error.")
      });
    }
  },
  async showOne(req, res) {
    try {
      const { postId } = req.params;
      const foundPost = await Post.findById(postId)
        .populate("author", USER_POPULATE_ARGS)
        .populate({
          path: "comments",
          populate: { path: "commentAuthor", select: USER_POPULATE_ARGS }
        })
        .sort({ createdDate: -1 })
        .lean()
        .exec();
      if (foundPost) {
        const nextPost = await Post.find({
          createdDate: { $lt: foundPost.createdDate }
        })
          .sort({ createdDate: -1 })
          .limit(1)
          .exec();
        const prevPost = await Post.find({
          createdDate: { $gt: foundPost.createdDate }
        })
          .sort({ createdDate: 1 })
          .limit(1)
          .exec();

        let prevPostId = null;
        let nextPostId = null;
        prevPost.length > 0 ? (prevPostId = prevPost[0]._id) : null;
        nextPost.length > 0 ? (nextPostId = nextPost[0]._id) : null;

        res.send({
          post: foundPost,
          nextPostId,
          prevPostId
        });
      } else {
        res.status(404).send({
          ...respond(false, "No post found.")
        });
      }
    } catch (e) {
      res.status(500).send({
        ...respond(false, "Internal Server Error.")
      });
    }
  },
  async getLatest(req, res) {
    try {
      const latestPosts = await Post.find({})
        .sort({ createdDate: -1 })
        .limit(3);
      res.send(latestPosts);
    } catch (error) {
      res.status(500).send({
        ...respond(false, "Internal Server Error.")
      });
    }
  },
  async addComment(req, res) {
    try {
      const { _id } = req.user;

      const { content } = req.body;
      const { postId } = req.params;
      const newComment = new Comment({
        content,
        commentAuthor: _id
      });
      newComment
        .save()
        .then(() => {
          return Post.findOneAndUpdate(
            { _id: postId },
            { $push: { comments: { $each: [newComment._id], $position: 0 } } },
            { new: true }
          )
            .populate("author", USER_POPULATE_ARGS)
            .populate("comments.commentAuthor", USER_POPULATE_ARGS);
        })
        .then(postUpd => {
          res
            .status(201)
            .send({
              postUpd
            })
            .end();
          socket.emit(`comments`, {
            action: "create",
            comment: postUpd.comments[0],
            postId: postUpd._id
          });
        });
    } catch (e) {
      res.status(500).send({
        ...respond(false, "Internal Server Error.")
      });
    }
  },
  async delete(req, res, next) {
    const { _id } = req.user;

    const { postId } = req.params;

    const foundPost = await Post.findOne({ _id: postId });

    if (foundPost.author != _id) {
      res.status(403).send({
        ...respond(false, "You have no permission to access this resourse.")
      });
    }
  },
  async like(req, res) {
    const { _id } = req.user;
  }
};
