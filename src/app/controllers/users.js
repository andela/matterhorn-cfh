/**
 * Module dependencies.
 */
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { all } from './avatars';
import validateInput from '../../config/middlewares/validateInput';

mongoose.Promise = global.Promise;
const User = mongoose.model('User');
mongoose.Promise = global.Promise;
require('dotenv').config();
/* eslint-disable no-underscore-dangle */
const avatarsAll = all();
/**
 * Auth callback
 */

export const authCallback = (req, res) => {
  res.redirect('/chooseavatars');
};

/**
 * Show login form
 */

export const signin = (req, res) => {
  if (!req.user) {
    res.redirect('/#!/signin?error=invalid');
  } else {
    res.redirect('/#!/app');
  }
};

/**
 * Show sign up form
 */

export const signup = (req, res) => {
  if (!req.user) {
    res.redirect('/#!/signup');
  } else {
    res.redirect('/#!/app');
  }
};

/**
 * Logout
 */

export const signout = (req, res) => {
  req.logout();
  res.redirect('/');
};

/**
 * Session
 */

export const session = (req, res) => {
  res.redirect('/');
};

/**
 * Check avatar - Confirm if the user who logged in via passport
 * already has an avatar. If they don't have one, redirect them
 * to our Choose an Avatar page.
 */

export const checkAvatar = (req, res) => {
  if (req.user && req.user.id) {
    User.findOne({
      id: req.user.id
    })
      .exec((err, user) => {
        if (user.avatar !== undefined) {
          res.redirect('/#!/');
        } else {
          res.redirect('/#!/choose-avatar');
        }
      });
  } else {
    // If user doesn't even exist, redirect to /
    res.redirect('/');
  }
};

/**
 * Register User
 */

export const register = (req, res) => {
  const { error, isValid } = validateInput(req.body);
  if (!isValid) {
    return res.status(401).send({
      message: error
    });
  }

  User.findOne({
    $or: [{ name: req.body.name }, { email: req.body.email }]
  })
    .then((existingUser) => {
      if (existingUser) {
        if (existingUser.name === req.body.name) {
          return res.status(409).send({
            message: 'Sorry, that name is in use already!'
          });
        }
        if (existingUser.email === req.body.email) {
          return res.status(409).send({
            message: 'Sorry, that email is in use already!'
          });
        }
      }
      const user = new User(req.body);
      // Switch the user's avatar index to an actual avatar url
      user.avatar = avatarsAll[user.avatar];
      user.provider = 'local';
      user.save()
        .then(() => {
          const token = jwt.sign(
            { user: user._id, name: user.name },
            process.env.TOKEN_SECRET,
            { expiresIn: 72 * 60 * 60 }
          );
          res.status(201).send({
            token,
            user: { id: user._id, name: user.name, email: user.email },
            message: 'Welcome to Matterhorn CFH',
          });
        })
        .catch(() => {
          res.status(500).send({
            message: 'Internal Server Error'
          });
        });
    })
    .catch(() => {
      res.status(500).send({
        message: 'Internal Server Error'
      });
    });
};

/**
 * Create user
 */

export const create = (req, res, next) => {
  if (req.body.name && req.body.password && req.body.email) {
    User.findOne({
      email: req.body.email
    }).exec((err, existingUser) => {
      if (!existingUser) {
        const user = new User(req.body);
        // Switch the user's avatar index to an actual avatar url
        user.avatar = avatarsAll[user.avatar];
        user.provider = 'local';
        user.save((err) => {
          if (err) {
            return res.render('/#!/signup?error=unknown', {
              errors: err.errors,
              user
            });
          }
          req.logIn(user, (err) => {
            if (err) return next(err);
            return res.redirect('/#!/');
          });
        });
      } else {
        return res.redirect('/#!/signup?error=existinguser');
      }
    });
  } else {
    return res.redirect('/#!/signup?error=incomplete');
  }
};


/**
* @param {req} req The request.
* @param {res} res The response.
* @returns {done} done Token generated on login.
 */
export const login = (req, res) => {
  const {
    email,
    password
  } = req.body;
  const { TOKEN_SECRET } = process.env;
  // checks if user exists
  return User
    .findOne({ email })
    .then((user) => {
      if (!user) {
        res.status(400).send({
          success: false,
          message: 'Invalid login credentials'
        });
      } else {
      // check if password is correct
        bcrypt.compare(password, user.hashed_password, (err, result) => {
          if (result) {
          // generate token upon login
            const token = jwt.sign(
              { user: user.id, email: user.email },
              TOKEN_SECRET,
              { expiresIn: 72 * 60 * 60 }
            );

            return res.send(200, {
              id: user.id,
              success: true,
              token: `${token}`,
              name: user.name,
              email: user.email,
              message: `You have logged in Successfully.
               Welcome to Cards for Humanity!!!`
            });
          }
          res.status(400).json({
            success: false,
            message: 'Invalid login credentials'
          });
        });
      }
    })
    .catch(error => res.status(400).send(error));
};
/**
 * Assign avatar to user
 */

export const avatars = (req, res) => {
  // Update the current user's profile to include the avatar choice they've made
  if (req.user && req.user.id && req.body.avatar !== undefined &&
    /\d/.test(req.body.avatar) && avatarsAll[req.body.avatar]) {
    User.findOne({
      _id: req.user.id
    })
      .exec((err, user) => {
        user.avatar = avatarsAll[req.body.avatar];
        user.save();
      });
  }
  return res.redirect('/#!/app');
};

export const addDonation = (req, res) => {
  if (req.body && req.user && req.user.id) {
    // Verify that the object contains crowdrise data
    if (req.body.amount && req.body.crowdrise_donation_id && req.body.donor_name) {
      User.findOne({
        _id: req.user.id
      })
        .exec((err, user) => {
          // Confirm that this object hasn't already been entered
          let duplicate = false;
          for (let i = 0; i < user.donations.length; i++) {
            if (user.donations[i].crowdrise_donation_id === req.body.crowdrise_donation_id) {
              duplicate = true;
            }
          }
          if (!duplicate) {
            user.donations.push(req.body);
            user.premium = 1;
            user.save();
          }
        });
    }
  }
  res.send();
};

/**
 *  Show profile
 */

export const show = (req, res) => {
  const user = req.profile;

  res.render('users/show', {
    title: user.name,
    user
  });
};

/**
 * Send User
 */

export const me = (req, res) => {
  res.jsonp(req.user || null);
};

/**
 * Find user by id
 */

export const user = (req, res, next, id) => {
  User
    .findOne({
      _id: id
    })
    .exec((err, loadUser) => {
      if (err) return next(err);
      if (!loadUser) return next(new Error(`Failed to load User ${id}`));
      req.profile = loadUser;
      next();
    });
};
