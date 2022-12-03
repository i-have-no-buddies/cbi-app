const bdmController = require('../controller/bdmLeadController');
const auth = require('../middleware/auth');

module.exports = (app) => {
  app.get('/bdm-lead', auth.authenticated, bdmController.index);
  app.get('/bdm-lead/:_id', auth.authenticated, bdmController.details);
};
