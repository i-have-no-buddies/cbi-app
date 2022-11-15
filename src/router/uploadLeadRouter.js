const uploadController = require('../controller/uploadLeadController')
const {
  validateUploadLead,
} = require('../middleware/validator/validateUploadLead')
const auth = require('../middleware/auth')

module.exports = (app) => {
  app.get('/upload-leads', auth.authenticated, uploadController.index)
  app.post(
    '/upload-leads/upload',
    auth.authenticated,
    validateUploadLead,
    uploadController.upload,
  )
}
