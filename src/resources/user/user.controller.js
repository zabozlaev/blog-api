const User = require("./user.model");
//
const { signToken, randToken } = require("../../utils/auth.js");

const transporter = require("../../utils/mailer.js");

const respond = require("../../utils/respond.js");

const socket = require("../../socket").admin;

const queue = require("../../queue");

module.exports = {
  async register(req, res) {
    try {
      const { email, password, username } = req.body;
      const isNew = !(await User.findOne({ email }));
      if (isNew) {
        const user = new User({ email, password, username });
        await user.save();

        const job = queue
          .create("email", {
            to: "snickeycs@gmail.com",
            from: "zabcode@zabcode-blog.com",
            subject: "Thank you for registration!",
            html: `
            <h1>Dear, ${username || email}. Thanks for registration!</h1>
          `
          })
          .priority("normal")
          .save(err => {
            if (err) console.log(`[QUEUE ERR] - JOB ${job.id}, err: ${err}`);
          });

        socket.emit("registration", {
          action: "created",
          user: {
            email,
            username: user.username,
            joinedAt: user.joinedAt
          }
        });
        res
          .status(201)
          .send({
            token: signToken(user),
            role: "member",
            ...respond(true, "You've successfuly registered.")
          })
          .end();
      } else {
        res.status(400).send({
          ...respond(false, "This email is already in use.")
        });
      }
    } catch (e) {
      console.log(e);
      res.status(500).send({
        ...respond(false, "Internal Server Error.")
      });
    }
  },
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });

      const isPassValid = await user.comparePassword(password);
      if (isPassValid) {
        const token = signToken(user);

        return res.status(201).send({
          token,
          role: user.role,
          username: user.username,
          ...respond(true, "Successful login.")
        });
      }
      return res.status(403).send({
        ...respond(false, "Invalid password.")
      });
    } catch (e) {
      res.status(500).send({
        ...respond(false, "Internal Server Error.")
      });
    }
  },
  async resetPassword(req, res) {
    // const { _id, email } = req.user;

    const email = req.body.email;

    const resetToken = randToken(16);

    const expirationDate = Date.now() + 3600000;

    try {
      const user = await User.findOne({ email });

      if (user.expirationDate > Date.now()) {
        return res
          .status(400)
          .send({
            ...respond(false, "Check your email box.")
          })
          .end();
      }

      user.expirationDate = expirationDate;
      user.resetToken = resetToken;
      await user.save();

      const job = queue
        .create("email", {
          to: "snickeycs@gmail.com",
          from: "ilya@zabcode.com",
          subject: "Reset Password",
          html: `
          <h1>You asked for password reset, right?</h1>
          <p>Click <a href="http://localhost:8080/confirm/${resetToken}">here to confirm. </a> (Token: ${resetToken})</p>
        `
        })
        .priority("high")
        .save(err => {
          if (err) console.log(err);
        });

      res.status(201).send({
        ...respond(true, "Email was sent.")
      });
    } catch (e) {
      res.status(500).send({
        ...respond(false, "Internal Server Error.")
      });
    }
  },
  async changePassword(req, res) {
    const { email, password } = req.body;

    const { resetToken } = req.params;

    const { _id } = req.user;

    try {
      const user = await User.findOne({ email, resetToken });

      if (!user || user.expirationDate < Date.now()) {
        return res.status(401).send({
          ...respond(false, "Your reset token has expired.")
        });
      }

      user.password = password;
      user.resetToken = null;
      user.expirationDate = null;
      await user.save();
      res.status(201).send({
        ...respond(true, "The password was changed.")
      });
    } catch (error) {
      res.status(500).send({
        ...respond(false, "Internal Server Error.")
      });
    }
  }
};
