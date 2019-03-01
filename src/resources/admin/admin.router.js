const { Router } = require("express");

const AdminRouter = Router();

const AdminController = require("./admin.controller");

const { getUserFromToken } = require("../../utils/auth");

const AdminMiddleware = require("./admin.middleware");

AdminRouter.use(getUserFromToken, AdminMiddleware);

AdminRouter.post("/post", AdminController.createPost);

AdminRouter.delete("/comment/:commentId", AdminController.deleteComment);

module.exports = AdminRouter;
