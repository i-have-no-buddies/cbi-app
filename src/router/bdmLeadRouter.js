const bdmController = require('../controller/bdmLeadController');
const auth = require('../middleware/auth');

module.exports = (app, setOnlineUser) => {
  app.get('/bdm-lead', auth.authenticated, setOnlineUser, bdmController.index);
  app.get(
    '/bdm-lead/:_id',
    auth.authenticated,
    setOnlineUser,
    bdmController.details
  );
};
