const leadManagementController = require('../controller/leadManagementController')
const {
  validateUploadLead,
} = require('../middleware/validator/validateUploadLead');
const {
  validateLeadEdit, validateLeadAdd
} = require('../middleware/validator/validateLeadManagement');

const auth = require('../middleware/auth');

module.exports = (app) => {
  app.get(
    '/lead-management',
    auth.authenticated,
    leadManagementController.index,
  );
  app.get(
    '/lead-management/upload',
    auth.authenticated,
    leadManagementController.upload,
  );
  app.post(
    '/lead-management/new_upload',
    auth.authenticated,
    validateUploadLead,
    leadManagementController.new_upload,
  );
  app.get(
    '/lead-management/add',
    auth.authenticated,
    leadManagementController.add
  );
  app.post(
    '/lead-management/create',
    auth.authenticated,
    validateLeadAdd,
    leadManagementController.create
  );
  app.get(
    '/lead-management/edit/:id',
    auth.authenticated,
    leadManagementController.edit
  );
  app.post(
    '/lead-management/update',
    auth.authenticated,
    validateLeadEdit,
    leadManagementController.update
  );
}
