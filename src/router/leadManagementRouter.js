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
  app.get(
    '/lead-management/upload',
    auth.authenticated,
    leadManagementController.upload,
  )
  app.post(
    '/lead-management/new_upload',
    auth.authenticated,
    validateUploadLead,
    leadManagementController.new_upload,
  )
}
