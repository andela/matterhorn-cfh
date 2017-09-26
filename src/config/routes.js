import passport from 'passport';
import { signin,
  signup,
  sendMail,
  searchUser,
  checkAvatar,
  signout,
  avatars,
  create,
  addDonation,
  session,
  me,
  login,
  show,
  authCallback,
  user
} from '../app/controllers/users';

import { allJSON } from '../app/controllers/avatars';
import { all, showAnswer, answer } from '../app/controllers/answers';
import {
  allQuestions,
  showQuestion,
  question } from '../app/controllers/questions';
import { play, render } from '../app/controllers/index';

import app from '../app';


export default () => {
  // User Routes
  app.get('/signin', signin);
  app.get('/signup', signup);
  app.get('/chooseavatars', checkAvatar);
  app.get('/signout', signout);
  app.get('/api/sendmail/:email', sendMail);
  app.get('/api/search/users/:username', searchUser);

  // Setting up the users api
  app.post('/users', create);
  app.post('/api/auth/login', login);
  app.post('/users/avatars', avatars);

  // Donation Routes
  app.post('/donations', addDonation);

  app.post('/users/session', passport.authenticate('local', {
    failureRedirect: '/signin',
    failureFlash: 'Invalid email or password.'
  }), session);

  app.get('/users/me', me);
  app.get('/users/:userId', show);

  // Setting the facebook oauth routes
  app.get('/auth/facebook', passport.authenticate('facebook', {
    scope: ['email'],
    failureRedirect: '/signin'
  }), signin);

  app.get('/auth/facebook/callback', passport.authenticate('facebook', {
    failureRedirect: '/signin'
  }), authCallback);

  // Setting the github oauth routes
  app.get('/auth/github', passport.authenticate('github', {
    failureRedirect: '/signin'
  }), signin);

  app.get('/auth/github/callback', passport.authenticate('github', {
    failureRedirect: '/signin'
  }), authCallback);

  // Setting the twitter oauth routes
  app.get('/auth/twitter', passport.authenticate('twitter', {
    failureRedirect: '/signin'
  }), signin);

  app.get('/auth/twitter/callback', passport.authenticate('twitter', {
    failureRedirect: '/signin'
  }), authCallback);

  // Setting the google oauth routes
  app.get('/auth/google', passport.authenticate('google', {
    failureRedirect: '/signin',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ]
  }), signin);

  app.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/signin'
  }), authCallback);

  // Finish with setting up the userId param
  app.param('userId', user);

  // Answer Routes
  app.get('/answers', all);
  app.get('/answers/:answerId', showAnswer);
  // Finish with setting up the answerId param
  app.param('answerId', answer);

  // Question Routes
  app.get('/questions', allQuestions);
  app.get('/questions/:questionId', showQuestion);
  // Finish with setting up the questionId param
  app.param('questionId', question);

  // Avatar Routes
  app.get('/avatars', allJSON);

  // Home route
  app.get('/play', play);
  app.get('/', render);
};
