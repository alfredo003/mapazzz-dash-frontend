const { auth } = require('../config/firebase-config');

const authenticateUser = (req, res, next) => {
  if (!req.session.token) {
    return res.redirect('/login');
  }
  next();
};

module.exports = { authenticateUser }; 