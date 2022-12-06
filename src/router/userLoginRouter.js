const userLoginController = require('../controller/userLoginController');
const auth = require('../middleware/auth');

module.exports = (app, setOnlineUser) => {
  app.get(
    '/user-login',
    auth.authenticated,
    setOnlineUser,
    userLoginController.index
  );
};
