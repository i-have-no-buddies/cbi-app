const leadManagementController = require('../controller/leadManagementController');
const {
  validateUploadLead,
} = require('../middleware/validator/validateUploadLead');
const {
  validateLeadEdit,
  validateLeadAddwithMeeting,
} = require('../middleware/validator/validateLeadManagement');

const auth = require('../middleware/auth');

module.exports = (app, setOnlineUser) => {
  app.get(
    '/lead-management',
    auth.authenticated,
    setOnlineUser,
    leadManagementController.index
  );
  app.get(
    '/lead-management/upload',
    auth.authenticated,
    setOnlineUser,
    leadManagementController.upload
  );
  app.post(
    '/lead-management/new_upload',
    auth.authenticated,
    setOnlineUser,
    validateUploadLead,
    leadManagementController.new_upload
  );
  app.get(
    '/lead-management/add',
    auth.authenticated,
    setOnlineUser,
    leadManagementController.add
  );
  app.post(
    '/lead-management/create',
    auth.authenticated,
    setOnlineUser,
    validateLeadAddwithMeeting,
    leadManagementController.create
  );
  app.get(
    '/lead-management/edit/:id',
    auth.authenticated,
    setOnlineUser,
    leadManagementController.edit
  );
  app.post(
    '/lead-management/update',
    auth.authenticated,
    setOnlineUser,
    validateLeadEdit,
    leadManagementController.update
  );
};
