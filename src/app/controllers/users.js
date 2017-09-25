/**
 * Module dependencies.
 */
import mongoose from 'mongoose';
import { all } from './avatars';

const User = mongoose.model('User');

const avatarsAll = all();

const helper = require('sendgrid').mail;
const sg = require('sendgrid')(process.env.SENDGRID_API_KEY);
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
 * Send invite mails to users
 * @function sendMail
 * @param {any} req -
 * @param {object} req.params - Contains the user's data
 * @param {any} res -
 * @returns {any} - sends mail
 */
exports.sendMail = (req, res) => {
  const { email } = req.params;
  const fromEmail = new helper.Email('matterhorn-cfh@andela.com');
  const toEmail = new helper.Email(email);
  const subject = 'CFH - Invitation to Play Game';
  const html = `
    <h3>Hi there</h3>
    <p>You have an invitation to play Card For Humanity (CFH). </p>
    <p>Cards for Humanity is a fast-paced online version of the popular card game, Cards Against Humanity, that gives you the opportunity to donate to children in need - all while remaining as despicable and awkward as you naturally are.</p><br />
    <p>Follow this link to join <a href="https://matterhorn-cfh-staging.herokuapp.com">MATTERHORN CFH</a>
      Get in the game now.</p>
      <p>Copyright &copy; 2017</p>
  `;
  const content = new helper.Content('text/html', html);
  const mail = new helper.Mail(fromEmail, subject, toEmail, content);
  const request = sg.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: mail.toJSON()
  });

  sg.API(request, (error, response) => {
    if (error) return res.jsonp(error);
    return res.jsonp(response);
  });
};

/**
 * Gets the list of users in the database
 * @function search
 * @param {any} req -
 * @param {string} req.params - the query string
 * @param {any} res -
 * @returns {object} - users
 */
exports.searchUser = (req, res) => {
  const { username } = req.params;
  User.find({
    name: { $regex: `^${username}`, $options: 'i' }
  }).exec((err, user) => {
    if (err) {
      res.jsonp({ error: '403' });
    }
    res.jsonp(user);
  });
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
  if (req.user && req.user._id) {
    User.findOne({
      _id: req.user._id
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
 * Assign avatar to user
 */

export const avatars = (req, res) => {
  // Update the current user's profile to include the avatar choice they've made
  if (req.user && req.user._id && req.body.avatar !== undefined &&
    /\d/.test(req.body.avatar) && avatarsAll[req.body.avatar]) {
    User.findOne({
      _id: req.user._id
    })
      .exec((err, user) => {
        user.avatar = avatarsAll[req.body.avatar];
        user.save();
      });
  }
  return res.redirect('/#!/app');
};

export const addDonation = (req, res) => {
  if (req.body && req.user && req.user._id) {
    // Verify that the object contains crowdrise data
    if (req.body.amount && req.body.crowdrise_donation_id && req.body.donor_name) {
      User.findOne({
        _id: req.user._id
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
            console.log('Validated donation');
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
