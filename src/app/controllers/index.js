/**
 * Module dependencies.
 */

/**
 * Redirect users to /#!/app (forcing Angular to reload the page)
 */

export const play = (req, res) => {
  if (Object.keys(req.query)[0] === 'custom') {
    res.redirect('/#!/app?custom');
  } else {
    res.redirect('/#!/app');
  }
};

export const render = (req, res) => {
  res.render('index', {
    user: req.user ? JSON.stringify(req.user) : 'null'
  });
};

export const showDashboard = (req, res) => {
  res.render('users/dashboard', {
    user: req.user ? JSON.stringify(req.user) : 'null'
  });
};

