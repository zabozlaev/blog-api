const respond = require("../../utils/respond");

module.exports = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .send({
        ...respond(false, "You have no permission to access this area.")
      })
      .end();
  }
  return next();
};
