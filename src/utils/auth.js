const jwt = require("jsonwebtoken");

const User = require("../resources/user/user.model");

const respond = require("./respond");

const {
  jwt: { secret, expiresIn }
} = require("../config");

const verifyToken = token => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, payload) => {
      if (err) reject(err);
      resolve(payload);
    });
  });
};

module.exports = {
  randToken(size) {
    const kit = "ABCDEFGHIJKLMNOPQRSTUVWXYZ_&1234567890$-abcdefghijklmnopqrstuvwxyz".split(
      ""
    );
    const length = kit.length - 1;

    let result = "";

    for (let i = 0; i < size; i += 1) {
      result += kit[Math.floor(Math.random() * length)];
    }
    return result;
  },
  verifyToken,
  async hasPermisson(token) {
    try {
      const { id, role } = await verifyToken(token);
      if (role !== "admin") return false;
      return id;
    } catch (error) {
      return false;
    }
  },
  signToken(user) {
    const jwtPayload = {
      id: user._id,
      role: user.role
    };
    // let's a token with id and one way role only :)
    return jwt.sign(jwtPayload, secret, { expiresIn });
  },
  async getUserFromToken(req, res, next) {
    const bearer = req.headers.authorization;
    //

    if (!bearer || !bearer.startsWith("Bearer ")) {
      return res
        .status(401)
        .send({
          ...respond(false, "Incorrect token provided.")
        })
        .end();
    }
    const token = bearer.split("Bearer ")[1].trim();

    try {
      const { id } = await verifyToken(token);

      const user = await User.findById(id)
        .select("-password")
        .lean()
        .exec();

      if (!user) {
        return res
          .status(401)
          .send({
            ...respond(false, "Token has expired.")
          })
          .end();
      } else if (user.isBanned) {
        return res
          .status(403)
          .send({
            ...respond(false, "You are banned.")
          })
          .end();
      }

      req.user = user;
      next();
    } catch (error) {
      console.log(error);
      return res
        .status(401)
        .send({
          ...respond(false, "Token has expired.")
        })
        .end();
    }
  },
  async signIn(req, res, next) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email })
        .select("-password")
        .lean()
        .exec();

      if (!user) {
        return res.status(404).send({
          ...respond(false, "No user found.")
        });
      }

      if (user.isBanned) {
        return res.status(403).send({
          ...respond(false, "You are banned.")
        });
      }

      req.user = user;

      return next();
    } catch (error) {
      res.status(500).send({
        ...respond(false, "Server Error.")
      });
    }
  }
};
