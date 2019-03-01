const express = require("express");

const cors = require("cors");
const { json, urlencoded } = require("body-parser");

const app = express();

const setUpDb = require("./utils/db");

const UserRoutes = require("./resources/user/user.router");
const PostRoutes = require("./resources/post/post.router");
const AdminRoutes = require("./resources/admin/admin.router");

const isDev = (process.env.DEV = true);

const { port } = require("./config");

const respond = require("./utils/respond");

if (isDev) {
  app.use(require("morgan")("dev"));
}

app.disable("x-powered-by");
app.use(cors());
app.use(urlencoded({ extended: false }));
app.use(json());

app.use("/api/user", UserRoutes);
app.use("/api/post", PostRoutes);
app.use("/api/admin", AdminRoutes);

app.use((_, res) => {
  res
    .status(404)
    .send({
      ...respond(false, "No found route")
    })
    .end();
});

module.exports = {
  async start() {
    try {
      await setUpDb({ useCreateIndex: true });
      app.listen(port);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  },
  app
};
