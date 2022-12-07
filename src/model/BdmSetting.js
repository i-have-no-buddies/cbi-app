const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { ngramsAlgov2 } = require('../utils/helper');
const { User } = require('./User');

const bdmSettingSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  ifa_name: {
    type: String,
  },
  bdm_name: {
    type: String,
  },
  ifa: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  bdm: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  created_at: {
    type: Date,
    default: Date.now,
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

bdmSettingSchema.pre('save', async function () {
  const setting = this;
  if (
    setting.isModified('name') ||
    setting.isModified('ifa') ||
    setting.isModified('bdm')
  ) {
    const ifa = await User.findById(setting.ifa).lean();
    const bdm = await User.findById(setting.bdm).lean();
    setting.ifa_name = `${ifa.first_name.toLowerCase().trim()} ${ifa.last_name
      .toLowerCase()
      .trim()}`;
    setting.bdm_name = `${bdm.first_name.toLowerCase().trim()} ${bdm.last_name
      .toLowerCase()
      .trim()}`;
    setting.tags = [
      ...ngramsAlgov2(setting.name.toLowerCase().trim(), 'name'),
      ...ngramsAlgov2(ifa._id.toString(), 'ifa'),
      ...ngramsAlgov2(bdm._id.toString(), 'bdm'),
    ];
  }
});

bdmSettingSchema.plugin(mongoosePaginate);

bdmSettingSchema.index({ 'tags.tag': 1, _id: 1 });

module.exports = {
  BdmSetting: mongoose.model('BdmSetting', bdmSettingSchema),
};
