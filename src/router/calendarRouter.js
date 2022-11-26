const calendarController = require('../controller/calendarController');
const auth = require('../middleware/auth');

module.exports = (app) => {
  app.get('/calendar', auth.authenticated, calendarController.index);
};