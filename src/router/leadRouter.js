const leadController = require('../controller/leadController')
const auth = require('../middleware/auth')
const {
  validateLeadEdit,
  validateLeadStatusEdit,
  validateMeetingOutcome,
} = require('../middleware/validator/validateLead')

module.exports = (app, setOnlineUser) => {
  app.get('/lead', auth.authenticated, setOnlineUser, leadController.index)
  app.get(
    '/lead/edit/:id',
    auth.authenticated,
    setOnlineUser,
    leadController.edit,
  )
  app.post(
    '/lead/update',
    auth.authenticated,
    setOnlineUser,
    validateLeadEdit,
    leadController.update,
  )
  app.post(
    '/lead/update-status',
    auth.authenticated,
    setOnlineUser,
    validateLeadStatusEdit,
    leadController.update_status,
  )

  app.post(
    '/lead-meeting/meeting-update',
    auth.authenticated,
    setOnlineUser,
    validateMeetingOutcome,
    leadController.meeting_update,
  )
}
