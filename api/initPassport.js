import passport from 'passport';
import { GraphQLLocalStrategy } from 'graphql-passport';

const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
import uuid from 'uuid/v4';

const GOOGLE_APP_ID = "922306780195-8bqqkr7pr1ccc4ujtqa50tg21ej3m5jr.apps.googleusercontent.com";
const GOOGLE_APP_SECRET = "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";

const FACEBOOK_APP_ID = "1105064673676144";
const FACEBOOK_APP_SECRET = "a0d67576c0f9e79415c05d027f2d8373";

// const initPassport = ({ User }) => {
//   passport.use(
//     new GraphQLLocalStrategy((email, password, done) => {
//       const users = User.getUsers();
//       const matchingUser = users.find(user => email === user.email && password === user.password);
//       const error = matchingUser ? null : new Error('no matching user');
//       done(error, matchingUser);
//     }),
//   );

//



//   passport.serializeUser((user, done) => {
//     done(null, user.id);
//   });

//   passport.deserializeUser((id, done) => {
//     const users = User.getUsers();
//     const matchingUser = users.find(user => user.id === id);
//     done(null, matchingUser);
//   });
// };
// export default initPassport;

const initPassport = ({ User }) => {
  passport.use(
    new GraphQLLocalStrategy((email, password, done) => {
      const users = User.getUsers();
      const matchingUser = users.find(user => email === user.email && password === user.password);
      const error = matchingUser ? null : new Error('no matching user');
      done(error, matchingUser);
    }),
  );
  const googleCallback = (accessToken, refreshToken, profile, done) => {

    const newUser = {
      id: uuid(),
      googleId: profile.id,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      email: profile.emails && profile.emails[0] && profile.emails[0].value,
    };
    console.log(newUser)
    done(null, newUser);
  };

  passport.use(new GoogleStrategy(
    {
      clientID: GOOGLE_APP_ID,
      clientSecret: GOOGLE_APP_SECRET,
      callbackURL: 'http://localhost:4000/auth/google/callback',
      profileFields: ['id', 'email', 'first_name', 'last_name'],
    },
    googleCallback,
  ));

  const facebookCallback = (accessToken, refreshToken, profile, done) => {
    const users = User.getUsers();
    const matchingUser = users.find(user => user.facebookId === profile.id);

    if (matchingUser) {
      done(null, matchingUser);
      return;
    }

    const newUser = {
      id: uuid(),
      facebookId: profile.id,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      email: profile.emails && profile.emails[0] && profile.emails[0].value,
    };
    users.push(newUser);
    done(null, newUser);
  };

  passport.use(new FacebookStrategy(
    {
      clientID: FACEBOOK_APP_ID,
      clientSecret: FACEBOOK_APP_SECRET,
      callbackURL: 'http://localhost:4000/auth/facebook/callback',
      profileFields: ['id', 'email', 'first_name', 'last_name'],
    },
    facebookCallback,
  ));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    const users = User.getUsers();
    const matchingUser = users.find(user => user.id === id);
    done(null, matchingUser);
  });
};

export default initPassport;
