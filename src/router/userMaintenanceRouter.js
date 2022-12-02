const userMaintenanceController = require('../controller/userMaintenanceController');
const auth = require('../middleware/auth');
const {
  validateUserAdd,
  validateUserEdit,
} = require('../middleware/validator/validateUser');

module.exports = (app) => {
  app.get(
    '/user-maintenance',
    auth.authenticated,
    userMaintenanceController.index
  );
  app.get(
    '/user-maintenance/add',
    auth.authenticated,
    userMaintenanceController.add
  );
  app.post(
    '/user-maintenance/create',
    auth.authenticated,
    validateUserAdd,
    userMaintenanceController.create
  );
  app.get(
    '/user-maintenance/edit/:_id',
    auth.authenticated,
    userMaintenanceController.edit
  );
  app.post(
    '/user-maintenance/update/:_id',
    auth.authenticated,
    validateUserEdit,
    userMaintenanceController.update
  );
};
