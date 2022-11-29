const bdmSettingsController = require('../controller/bdmSettingsController');
const auth = require('../middleware/auth');
const {
  validateBdmSettingAdd,
  validateBdmSettingEdit,
} = require('../middleware/validator/validatorBdmSetting');

module.exports = (app) => {
  app.get('/bdm-settings', auth.authenticated, bdmSettingsController.index);
  app.get('/bdm-settings/add', auth.authenticated, bdmSettingsController.add);
  app.post(
    '/bdm-settings/create',
    auth.authenticated,
    validateBdmSettingAdd,
    bdmSettingsController.create
  );
  app.get(
    '/bdm-settings/edit/:_id',
    auth.authenticated,
    bdmSettingsController.edit
  );
  app.post(
    '/bdm-settings/update/:_id',
    auth.authenticated,
    validateBdmSettingEdit,
    bdmSettingsController.update
  );
  app.post(
    '/bdm-settings/delete/:_id',
    auth.authenticated,
    bdmSettingsController.delete
  );
};
