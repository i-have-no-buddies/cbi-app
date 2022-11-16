const userOnlineController = require('../controller/userOnlineController');
const auth = require('../middleware/auth');

module.exports = (app) => {
  app.get('/user-online', auth.authenticated, userOnlineController.index);
};
