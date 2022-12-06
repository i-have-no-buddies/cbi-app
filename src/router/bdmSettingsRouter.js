const bdmSettingsController = require('../controller/bdmSettingsController');
const auth = require('../middleware/auth');
const {
  validateBdmSettingAdd,
  validateBdmSettingEdit,
} = require('../middleware/validator/validatorBdmSetting');

module.exports = (app, setOnlineUser) => {
  app.get(
    '/bdm-settings',
    auth.authenticated,
    setOnlineUser,
    bdmSettingsController.index
  );
  app.get(
    '/bdm-settings/add',
    auth.authenticated,
    setOnlineUser,
    bdmSettingsController.add
  );
  app.post(
    '/bdm-settings/create',
    auth.authenticated,
    setOnlineUser,
    validateBdmSettingAdd,
    bdmSettingsController.create
  );
  app.get(
    '/bdm-settings/edit/:_id',
    auth.authenticated,
    setOnlineUser,
    bdmSettingsController.edit
  );
  app.post(
    '/bdm-settings/update/:_id',
    auth.authenticated,
    setOnlineUser,
    validateBdmSettingEdit,
    bdmSettingsController.update
  );
  app.post(
    '/bdm-settings/delete/:_id',
    auth.authenticated,
    setOnlineUser,
    bdmSettingsController.delete
  );
};
