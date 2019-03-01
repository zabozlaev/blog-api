const { Router } = require("express");

const UserRouter = Router();

const validationMiddleware = require("../../utils/validate.js");

const UserController = require("./user.controller");

const { getUserFromToken } = require("../../utils/auth");

UserRouter.post("/register", validationMiddleware, UserController.register);
UserRouter.post("/login", validationMiddleware, UserController.login);
UserRouter.post("/reset", UserController.resetPassword);

UserRouter.put("/reset/:resetToken", UserController.changePassword);

module.exports = UserRouter;
