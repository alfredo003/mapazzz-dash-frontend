const { auth } = require('../config/firebase-config');

const authenticateUser = (req, res, next) => {
  if (!req.session.userId) {
    req.flash('error', 'Você precisa fazer login para acessar essa página.');
    return res.redirect('/login');
  }
  next();
};

module.exports = { authenticateUser }; 