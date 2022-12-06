const reportsController = require('../controller/reportsController');
const auth = require('../middleware/auth');

module.exports = (app, setOnlineUser) => {
  app.get(
    '/reports',
    auth.authenticated,
    setOnlineUser,
    reportsController.index
  );
};
