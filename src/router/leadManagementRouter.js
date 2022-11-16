const leadManagementController = require('../controller/leadManagementController')
const {
  validateUploadLead,
} = require('../middleware/validator/validateUploadLead')
const auth = require('../middleware/auth')

module.exports = (app) => {
  app.get(
    '/lead-management',
    auth.authenticated,
    leadManagementController.index,
  )
  app.post(
    '/lead-management/upload',
    auth.authenticated,
    validateUploadLead,
    leadManagementController.upload,
  )
}
