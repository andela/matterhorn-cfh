import mongoose from 'mongoose';
import passportLocal from 'passport-local';
import passportTwitter from 'passport-twitter';
import passportFacebook from 'passport-facebook';
import passportGithub from 'passport-github';
import passportGoogle from 'passport-google-oauth';
import passport from 'passport';
import dotenv from 'dotenv';
import config from './config';

/* eslint-disable no-underscore-dangle */

const User = mongoose.model('User');

dotenv.load();

export default () => {
  const LocalStrategy = passportLocal.Strategy;
  const TwitterStrategy = passportTwitter.Strategy;
  const FacebookStrategy = passportFacebook.Strategy;
  const GitHubStrategy = passportGithub.Strategy;
  const GoogleStrategy = passportGoogle.OAuth2Strategy;

  // Serialize sessions
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findOne({
      _id: id
    }, (err, user) => {
      user.email = null;
      user.facebook = null;
      user.hashed_password = null;
      done(err, user);
    });
  });

  // Use local strategy
  passport.use(new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    ((email, password, done) => {
      User.findOne({
        email
      }, (err, user) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, {
            message: 'Unknown user'
          });
        }
        if (!user.authenticate(password)) {
          return done(null, false, {
            message: 'Invalid password'
          });
        }
        user.email = null;
        user.hashed_password = null;
        return done(null, user);
      });
    })
  ));

  // Use twitter strategy
  passport.use(new TwitterStrategy(
    {
      consumerKey: process.env.CONSUMER_KEY || config.twitter.clientID,
      consumerSecret:
      process.env.CONSUMER_SECRET || config.twitter.clientSecret,
      callbackURL: config.twitter.callbackURL
    },
    ((token, tokenSecret, profile, done) => {
      User.findOne({
        'twitter.id_str': profile.id
      }, (err, user) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          user = new User({
            name: profile.displayName,
            username: profile.username,
            provider: 'twitter',
            twitter: profile._json
          });
          user.save(err => done(err, user));
        } else {
          return done(err, user);
        }
      });
    })
  ));

  // Use facebook strategy
  passport.use(new FacebookStrategy(
    {
      clientID: process.env.FB_CLIENT_ID || config.facebook.clientID,
      clientSecret: process.env.FB_CLIENT_SECRET
      || config.facebook.clientSecret,
      callbackURL: config.facebook.callbackURL
    },
    ((accessToken, refreshToken, profile, done) => {
      User.findOne({
        'facebook.id': profile.id
      }, (err, user) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          user = new User({
            name: profile.displayName,
            username: profile.displayName.split(' ').join('_').toLowerCase(),
            provider: 'facebook',
            facebook: profile._json
          });
          user.save((err) => {
            user.facebook = null;
            return done(err, user);
          });
        } else {
          user.facebook = null;
          return done(err, user);
        }
      });
    })
  ));

  // Use github strategy
  passport.use(new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID || config.github.clientID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET ||
      config.github.clientSecret,
      callbackURL: config.github.callbackURL
    },
    ((accessToken, refreshToken, profile, done) => {
      User.findOne({
        'github.id': profile.id
      }, (err, user) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          user = new User({
            name: profile.displayName,
            username: profile.username,
            provider: 'github',
            github: profile._json
          });
          user.save(() => done(err, user));
        } else {
          return done(err, user);
        }
      });
    })
  ));

  // Use google strategy
  passport.use(new GoogleStrategy(
    {
      clientID: process.env.APP_ID || config.google.clientID,
      clientSecret:
      process.env.APP_SECRET || config.google.clientSecret,
      callbackURL: config.google.callbackURL
    },
    ((accessToken, refreshToken, profile, done) => {
      User.findOne({
        'google.id': profile.id
      }, (err, user) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          user = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            username: profile.username,
            provider: 'google',
            google: profile._json
          });
          user.save(err => done(err, user));
        } else {
          return done(err, user);
        }
      });
    })
  ));
};
