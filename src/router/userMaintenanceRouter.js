const userMaintenanceController = require('../controller/userMaintenanceController');
const auth = require('../middleware/auth');

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
    userMaintenanceController.create
  );
  app.get(
    '/user-maintenance/edit/:id',
    auth.authenticated,
    userMaintenanceController.edit
  );
  app.post(
    '/user-maintenance/update',
    auth.authenticated,
    userMaintenanceController.update
  );
};
