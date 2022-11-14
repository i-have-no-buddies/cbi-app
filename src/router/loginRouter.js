const loginController = require('../controller/loginController');
const auth = require('../middleware/auth');

module.exports = (app) => {
  app.get('/', loginController.index);
  app.get('/login', loginController.index);
  app.post('/login', loginController.login);
  app.get('/logout', auth.authenticated, loginController.logout);
};
