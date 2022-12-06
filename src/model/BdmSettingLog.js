const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const bdmSettingLogSchema = new mongoose.Schema({
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  bdm_setting_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BdmSetting',
  },
  data: {
    type: Object,
  },
});

bdmSettingLogSchema.plugin(mongoosePaginate);

module.exports = {
  BdmSettingLog: mongoose.model('BdmSettingLog', bdmSettingLogSchema),
};
