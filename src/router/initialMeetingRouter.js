const initialMeetingController = require('../controller/initialMeetingController');
const auth = require('../middleware/auth');
const {
  validateLeadEdit,
  validateLeadStatusEdit,
  validateMeetingOutcome
} = require('../middleware/validator/validateInitalMeeting');

module.exports = (app, setOnlineUser) => {
  app.get(
    '/initial-meeting',
    auth.authenticated,
    setOnlineUser,
    initialMeetingController.index
  ); 
  app.get(
    '/initial-meeting/edit/:id',
    auth.authenticated,
    setOnlineUser,
    initialMeetingController.edit,
  )
  app.post(
    '/initial-meeting/update',
    auth.authenticated,
    setOnlineUser,
    validateLeadEdit,
    initialMeetingController.update,
  )
  app.post(
    '/initial-meeting/update-status',
    auth.authenticated,
    setOnlineUser,
    validateLeadStatusEdit,
    initialMeetingController.update_status,
  )
  app.post(
    '/initial-meeting/meeting-update',
    auth.authenticated,
    setOnlineUser,
    validateMeetingOutcome,
    initialMeetingController.meeting_update,
  )
};
