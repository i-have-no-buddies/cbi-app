const loginController = require('../controller/loginController');
const auth = require('../middleware/auth');

const rateLimit = require('express-rate-limit');

const limitLoginPageRequest = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => req.ip,
  handler: (req, res, next) => {
    return res.render('429');
  },
});

const limitLoginPageSubmit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => req.ip,
  handler: (req, res, next) => {
    return res.render('429');
  },
});

const setDefaultCredentials = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    res.locals.DEFAULT_EMAIL = process.env.DEFAULT_EMAIL;
    res.locals.DEFAULT_PASSWORD = process.env.DEFAULT_PASSWORD;
  }
  next();
};

module.exports = (app) => {
  app.get('/', limitLoginPageRequest, setDefaultCredentials, loginController.index);
  app.get('/login', limitLoginPageRequest, setDefaultCredentials, loginController.index);
  app.post('/login', limitLoginPageSubmit, loginController.login);
  app.get('/logout', auth.authenticated, loginController.logout);
};
