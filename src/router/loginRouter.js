const loginController = require('../controller/loginController');
const auth = require('../middleware/auth');

const setDefaultCredentials = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    res.locals.DEFAULT_EMAIL = process.env.DEFAULT_EMAIL;
    res.locals.DEFAULT_PASSWORD = process.env.DEFAULT_PASSWORD;
  }
  next();
};

module.exports = (app) => {
  app.get('/', setDefaultCredentials, loginController.index);
  app.get('/login', setDefaultCredentials, loginController.index);
  app.post('/login', loginController.login);
  app.get('/logout', auth.authenticated, loginController.logout);
};
