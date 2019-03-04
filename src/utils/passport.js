const passport = require("passport");

const passportVkontakte = require("passport-vkontakte");

const User = require("../resources/user/user.model");

const { Strategy } = passportVkontakte;

passport.use(
  "vkToken",
  new Strategy(
    {
      clientID: "6841845",
      clientSecret: "H2qKZK8BMEeagubZfPOa",
      callbackURL: "http://localhost:3000/api/user/auth/vkontakte/",
      passReqToCallback: true
    },
    async (accessToken, refreshToken, params, profile, done) => {
      try {
        const doesExist = await User.findOne({ vkId: profile.id });

        if (doesExist) {
          return done(false, doesExist);
        }

        const newOne = new User({
          vkId: profile.id,
          username: profile.displayName,
          avatarUrl: profile.photos[0].value
        });
        await newOne.save();
        done(false, newOne);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);
