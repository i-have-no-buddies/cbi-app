const userOnlineController = require('../controller/userOnlineController');
const auth = require('../middleware/auth');

module.exports = (app, setOnlineUser) => {
  app.get('/user-online', auth.authenticated, setOnlineUser, userOnlineController.index);
};
