/**
 * Module dependencies.
 */
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import jwtDecode from 'jwt-decode';
import bcrypt from 'bcrypt';
import moment from 'moment';
import { all } from './avatars';
import validateInput from '../../config/middlewares/validateInput';


mongoose.Promise = global.Promise;
const User = mongoose.model('User');
const Game = mongoose.model('Game');
const Board = mongoose.model('Board');
const Rank = mongoose.model('Rank');
mongoose.Promise = global.Promise;
require('dotenv').config();
/* eslint-disable no-underscore-dangle */


const avatarsAll = all();

const helper = require('sendgrid').mail;
const sg = require('sendgrid')(process.env.SENDGRID_API_KEY);
/**
 * @param {object} req -request
 * @param {object} res - response
 * @returns {object} returns a string containing the users data
 */
export const saveLeaderData = (req, res) => {
  const token = req.headers.authorization;
  const decoded = jwtDecode(token);
  const leaderboard = new Board();
  leaderboard.gameId = req.body.gameID;
  leaderboard.username = decoded.name;
  leaderboard.playerPoint = req.body.gameWinnerPoint;
  leaderboard.playerId = decoded.user;
  leaderboard.date = new Date();
  leaderboard.save((error, leadboard) => {
    if (error) {
      return error;
    }
    res.json(leadboard);
  });
};
/**
 * @param {object} req -request
 * @param {object} res - response
 * @returns {object} returns a string containing leaderboard object
 */
  // Gets leaderboard
exports.getLeaderBoard = (req, res) => {
  const leaderData = [];
  Board.find({})
    .limit(20)
    .sort({ playerPoint: -1 })
    .exec((error, records) => {
      for (let i = 0; i < records.length; i += 2) {
        leaderData.push(records[i]);
      }
      res.send(leaderData);
    });
};

export const authCallback = (req, res) => {
  const { TOKEN_SECRET } = process.env;
  if (req.user && req.user.newUser) {
    const { profileId, provider } = req.user;
    res.cookie('profileId', profileId);
    res.cookie('provider', provider);
    res.redirect('/#!/signup');
  } else if (!req.user) {
    res.redirect('/#!/signin?error=emailRequired');
  } else {
    const token = jwt.sign(
      { user: req.user.id, name: req.user.name },
      TOKEN_SECRET,
      { expiresIn: 72 * 60 * 60 }
    );
    res.cookie('token', token);
    req.headers.authorization = `Bearer ${token}`;
    res.redirect('/#!/');
  }
};

/** Checks if logged in user has valid AUTH token
 * @param  {object} req - request
 * @param  {object} res - response
 */

export const isLoggedIn = (req, res, next) => {
  const key = process.env.TOKEN_SECRET;
  const token = req.headers.authorization || req.headers['x-access-token'];
  // let token;
  // const tokenAvailable = req.headers.authorization ||
  //   req.headers['x-access-token'];
  // if (req.headers.authorization) {
  //   [, token] = req.headers.authorization.split(' ');
  // } else {
  //   token = tokenAvailable;
  // }

  if (token) {
    jwt.verify(token, key, (error, decoded) => {
      if (error) {
        res.status(401)
          .send({
            message: 'Failed to Authenticate Token',
            error
          });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    return res.status(401)
      .send({
        message: 'Access denied, Authentication token does not exist'
      });
  }
};


export const isAuthenticated = (req, res, next) => {
  const token = req.headers.authorization || req.headers['x-access-token'];
  if (token) {
    jwt.verify(token, process.env.TOKEN_SECRET, (error, decoded) => {
      if (error) {
        return res.status(401)
          .send({
            message: 'Failed to Authenticate Token',
            error
          });
      }
      req.user = decoded;
      req.decoded = decoded;
      next();
    });
  } else {
    return res.status(401)
      .send({
        message: 'Access denied, Authentication token does not exist'
      });
  }
};

export const addFriend = (req, res) => {
  const { friendId, friendName } = req.body;
  const friendData = { friendId, friendName };
  const userId = req.decoded.user;

  User.findOneAndUpdate(
    {
      _id: userId
    },
    { $push: { friends: friendData } }
  )
    .then(() => {
      res.status(200).send({
        message: 'Friend Added Successfully'
      });
    })
    .catch((error) => {
      res.status(500).send({
        error,
        message: 'Internal Server Error'
      });
    });
};

export const getFriendsList = (req, res) => {
  const userId = req.decoded.user;

  User.find({
    _id: userId
  })
    .then((user) => {
      if (user) {
        res.status(200).send(user[0].friends);
      } else {
        res.status(404).send({ message: 'User Not Found' });
      }
    })
    .catch(() => {
      res.status(500).send({
        message: 'Internal Server Error'
      });
    });
};

export const getRankData = (req, res) => {
  Rank.find({})
    .sort({ wins: -1 })
    .then(data => res.send({
      data
    }));
};

export const saveGameRank = (req, res) =>
  User.findOne({
    name: req.body.username
  })
    .then((user) => {
      if (user) {
        const rank = new Rank();
        rank.location = user.location;
        Rank.find({
          location: user.location
        })
          .then((region) => {
            if (region.length > 0) {
              Rank.update(
                {
                  location: user.location
                },
                { $inc: { wins: 1 } },
                () => {
                  res.json({
                    message: 'Updated successfully!'
                  });
                }
              );
            } else {
              rank.save((error) => {
                if (error) {
                  return error;
                }
                res.json(rank);
              });
            }
          })
          .catch(() => {
            res.status(500).send({
              message: 'Internal Server Error'
            });
          });
      }
    });

export const saveGameData = (req, res) => {
  const token = req.headers.authorization;
  const decoded = jwtDecode(token);
  const game = new Game();
  game.gameUserID = decoded.user;
  game.gameUsername = decoded.name;
  game.gameOwner = req.body.gameOwner;
  game.gameId = req.params.id;
  game.gameWinner = req.body.gameWinner;
  game.gameWinnerPoints = req.body.gameWinnerPoints;
  game.date = new Date();
  game.gamePlayers = req.body.gamePlayers;

  game.save((error) => {
    if (error) {
      return error;
    }
    res.json(game);
  });
};

export const donations = (req, res) => {
  const userId = req.decoded.user;
  User.findOne({
    _id: userId
  })
    .exec((err, user) => {
      // Confirm that this object hasn't already been entered
      res.status(200).send({ donations: user.donations });
    });
};

export const getGameData = (req, res) => {
  const token = req.headers.authorization;
  const decoded = jwtDecode(token);
  Game
    .find({ gameUsername: decoded.name }, (err, resp) => {
      if (err) res.send(err);
      res.send(resp);
    });
};


/**
 *  Retrieves the token from cookie
 * @param {object} req -request
 * @param {object} res - response
 * @returns {object} returns a string containing the token
 */
export const getToken = (req, res) => {
  const cookie = req.cookies.token;
  res.send({
    cookie
  });
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
    <p>Cards for Humanity is a fast-paced online version of the
    popular card game, Cards Against Humanity, that gives you
    the opportunity to donate to children in need - all while
    remaining as despicable and awkward as you naturally are.</p><br />
    <p>Follow this link to join
    <a href="https://matterhorn-cfh-staging.herokuapp.com">MATTERHORN CFH</a>
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
    $and: [
      { _id: { $nin: [`${req.decoded.user}`] } },
      { name: { $regex: `^${username}.*`, $options: 'i' } }
    ]
  })
    .then((result) => {
      res.status(200).send(result);
    })
    .catch(error => res.status(501).send({
      message: 'Internal Server Error',
      error
    }));
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
      user.provider = req.body.provider || 'local';
      user.save()
        .then(() => {
          const token = jwt.sign(
            { user: user._id, name: user.name, email: user.email },
            process.env.TOKEN_SECRET,
            { expiresIn: 72 * 60 * 60 }
          );
          req.headers.authorization = `Bearer ${token}`;
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
        user.last_login = moment();
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
            user.last_login = moment();
            user.save();
            // generate token upon login
            const token = jwt.sign(
              {
                name: user.name,
                user: user.id,
                email: user.email
              },
              TOKEN_SECRET,
              { expiresIn: 72 * 60 * 60 }
            );
            req.headers.authorization = `Bearer ${token}`;
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
/* eslint-disable no-plusplus */
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
  if (req.body && req.decoded.user) {
    // Verify that the object contains crowdrise data
    if (req.body.amount && req.body.crowdrise_donation_id &&
      req.body.donor_name) {
      User.findOne({
        _id: req.decoded.user
      })
        .exec((err, user) => {
          // Confirm that this object hasn't already been entered
          let duplicate = false;
          for (let i = 0; i < user.donations.length; i++) {
            if (user.donations[i].crowdrise_donation_id ===
              req.body.crowdrise_donation_id) {
              duplicate = true;
              res.status(200).send({
                message: 'Duplicate donation not allowed'
              });
            }
          }
          if (!duplicate) {
            user.donations.push(req.body);
            user.premium = 1;
            user.save();
            res.status(200).send({ message: 'Donation has been saved' });
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
