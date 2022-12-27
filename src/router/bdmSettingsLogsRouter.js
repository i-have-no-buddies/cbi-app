const bdmSettingsLogsController = require('../controller/bdmSettingsLogsController');
const auth = require('../middleware/auth');

module.exports = (app, setOnlineUser) => {
  app.get(
    '/bdm-settings-logs',
    auth.authenticated,
    setOnlineUser,
    bdmSettingsLogsController.index
  );
  app.get(
    '/bdm-settings-logs/:_id',
    auth.authenticated,
    setOnlineUser,
    bdmSettingsLogsController.details
  );
};
