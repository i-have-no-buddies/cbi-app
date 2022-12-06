const userMaintenanceController = require('../controller/userMaintenanceController');
const auth = require('../middleware/auth');
const {
  validateUserAdd,
  validateUserEdit,
} = require('../middleware/validator/validateUser');

module.exports = (app, setOnlineUser) => {
  app.get(
    '/user-maintenance',
    auth.authenticated,
    setOnlineUser,
    userMaintenanceController.index
  );
  app.get(
    '/user-maintenance/add',
    auth.authenticated,
    setOnlineUser,
    userMaintenanceController.add
  );
  app.post(
    '/user-maintenance/create',
    auth.authenticated,
    setOnlineUser,
    validateUserAdd,
    userMaintenanceController.create
  );
  app.get(
    '/user-maintenance/edit/:_id',
    auth.authenticated,
    setOnlineUser,
    userMaintenanceController.edit
  );
  app.post(
    '/user-maintenance/update/:_id',
    auth.authenticated,
    setOnlineUser,
    validateUserEdit,
    userMaintenanceController.update
  );
};
