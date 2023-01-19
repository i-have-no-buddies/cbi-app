const initialMeetingController = require('../controller/initialMeetingController');
const auth = require('../middleware/auth');

module.exports = (app, setOnlineUser) => {
  app.get(
    '/initial-meeting',
    auth.authenticated,
    initialMeetingController.index
  );
};
