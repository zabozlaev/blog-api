const Joi = require("joi");

const respond = require("./respond.js");

module.exports = (req, res, next) => {
  const schema = Joi.object().keys({
    email: Joi.string()
      .email({})
      .required(),
    password: Joi.string()
      .regex(/^[a-zA-Z0-9]{8,32}$/)
      .required()
  });

  const { email, password } = req.body;

  const { error } = Joi.validate({ email, password }, schema);

  if (!email || !password) {
    return res
      .status(422)
      .send({
        ...respond(false, "No credentials provided.")
      })
      .end();
  }

  if (!error) {
    return next();
  }

  const errorKey = error.details[0].context.key;

  switch (errorKey) {
    case "email":
      res.status(422).send({
        ...respond(false, "Invalid email provided.")
      });

      break;

    case "password":
      res.status(422).send({
        ...respond(false, "Invalid password prorived.")
      });

      break;

    default:
      res.status(422).send({
        ...respond(false, "Invalid email and password.")
      });
  }
};
