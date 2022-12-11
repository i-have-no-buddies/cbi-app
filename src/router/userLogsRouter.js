const userLogsController = require('../controller/userLogsController');
const auth = require('../middleware/auth');

module.exports = (app, setOnlineUser) => {
  app.get(
    '/user-logs',
    auth.authenticated,
    setOnlineUser,
    userLogsController.index
  );
  app.get(
    '/user-logs/:_id',
    auth.authenticated,
    setOnlineUser,
    userLogsController.details
  );
};
