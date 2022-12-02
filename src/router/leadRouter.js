const leadController = require('../controller/leadController');
const auth = require('../middleware/auth');
const {
  validateLeadEdit,
  validateLeadStatusEdit,
} = require('../middleware/validator/validateLead');

module.exports = (app) => {
  app.get('/lead', auth.authenticated, leadController.index);
  app.get('/lead/edit/:id', auth.authenticated, leadController.edit);
  app.post(
    '/lead/update',
    auth.authenticated,
    validateLeadEdit,
    leadController.update
  );
  app.post(
    '/lead/update-status',
    auth.authenticated,
    validateLeadStatusEdit,
    leadController.update_status
  );
};
