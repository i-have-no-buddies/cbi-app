const bdmController = require('../controller/bdmController');
const auth = require('../middleware/auth');

module.exports = (app) => {
  app.get('/bdm', auth.authenticated, bdmController.index);
};