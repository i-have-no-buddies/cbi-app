const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { ngramsAlgov2 } = require('../utils/helper');

const bdmSettingLogSchema = new mongoose.Schema({
  created_at: {
    type: Date,
    default: Date.now,
  },
  created_by: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
  setting_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  current: {
    type: Object,
  },
  previous: {
    type: Object,
  },
  modified: {
    type: Array,
  },
  tags: {
    type: [
      {
        _id: false,
        tag: {
          type: String,
        },
      },
    ],
  },
});

bdmSettingLogSchema.pre('save', async function (next) {
  this.tags = [
    ...ngramsAlgov2(this.setting_id.toString(), '_id'),
    ...ngramsAlgov2(this.current.ifa_name.trim().toLowerCase(), 'first_name'),
    ...ngramsAlgov2(this.current.bdm_name.trim().toLowerCase(), 'last_name'),
    ...ngramsAlgov2(this.current.status.toLowerCase(), 'status'),
  ];
  next();
});

bdmSettingLogSchema.plugin(mongoosePaginate);

module.exports = {
  BdmSettingLog: mongoose.model('BdmSettingLog', bdmSettingLogSchema),
};
