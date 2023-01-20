const reportsController = require('../controller/reportsController');
const auth = require('../middleware/auth');

module.exports = (app, setOnlineUser) => {
  app.get(
    '/reports',
    auth.authenticated,
    setOnlineUser,
    reportsController.index
  );
  app.get(
    '/reports/users',
    auth.authenticated,
    setOnlineUser,
    reportsController.downloadUserReport
  );
  app.get(
    '/reports/user-logs',
    auth.authenticated,
    setOnlineUser,
    reportsController.downloadUserLogReport
  );
  app.get(
    '/reports/user-logins',
    auth.authenticated,
    setOnlineUser,
    reportsController.downloadUserLoginReport
  );
};
