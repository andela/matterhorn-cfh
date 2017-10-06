/**
 * Module dependencies.
 */
import mongoose from 'mongoose';

const Question = mongoose.model('Question');


/**
 * Find question by id
 */

export const question = (req, res, next, id) => {
  Question.load(id, (err, loadQuestion) => {
    if (err) return next(err);
    if (!loadQuestion) return next(new Error(`Failed to load question ${id}`));
    req.question = loadQuestion;
    next();
  });
};

/**
 * Show an question
 */

export const showQuestion = (req, res) => {
  res.jsonp(req.question);
};

/**
 * List of Questions
 */

export const allQuestions = (req, res) => {
  Question
    .find({
      official: true,
      numAnswers: { $lt: 3 }
    })
    .select('-_id')
    .exec((err, questions) => {
      if (err) {
        res.render('error', {
          status: 500
        });
      } else {
        res.jsonp(questions);
      }
    });
};

/**
 * List of Questions (for Game class)
 */

export const allQuestionsForGame = (cb) => {
  Question
    .find({
      official: true,
      numAnswers: { $lt: 3 }
    })
    .select('-_id')
    .exec((err, questions) => {
      if (err) {
        return (err);
      }
      cb(questions);
    });
};
