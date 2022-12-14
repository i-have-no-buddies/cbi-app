const calendarController = require('../controller/calendarController');
const auth = require('../middleware/auth');

module.exports = (app, setOnlineUser) => {
  app.get(
    '/calendar',
    auth.authenticated,
    setOnlineUser,
    calendarController.index
  );
};
