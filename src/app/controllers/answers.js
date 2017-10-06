/**
 * Module dependencies.
 */
import mongoose from 'mongoose';

const Answer = mongoose.model('Answer');


/**
 * Find answer by id
 */

export const answer = (req, res, next, id) => {
  Answer.load(id, (err, loadAnswer) => {
    if (err) return next(err);
    if (!loadAnswer) return next(new Error(`Failed to load answer ${id}`));
    req.answer = loadAnswer;
    next();
  });
};

/**
 * Show an answer
 */

export const showAnswer = (req, res) => {
  res.jsonp(req.answer);
};

/**
 * List of Answers
 */

export const all = (req, res) => {
  Answer.find({ official: true }).select('-_id').exec((err, answers) => {
    if (err) {
      res.render('error', {
        status: 500
      });
    } else {
      res.jsonp(answers);
    }
  });
};

/**
 * List of Answers (for Game class)
 */

export const allAnswersForGame = (cb) => {
  Answer.find({ official: true }).select('-_id').exec((err, answers) => {
    if (err) {
      return (err);
    }
    cb(answers);
  });
};
