const { Router } = require("express");

const PostRouter = Router();

const PostController = require("./post.controller");

const { getUserFromToken } = require("../../utils/auth");

PostRouter.get("/", PostController.showAll);
PostRouter.get("/:postId", PostController.showOne);

PostRouter.post(
  "/comment/:postId",
  getUserFromToken,
  PostController.addComment
);

module.exports = PostRouter;
