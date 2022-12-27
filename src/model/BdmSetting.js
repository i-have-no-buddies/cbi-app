const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { ngramsAlgov2 } = require('../utils/helper');
const { User } = require('./User');
const { BdmSettingLog } = require('../model/BdmSettingLog');

const EXCLUDED_FIELDS = [
  '_id',
  '__v',
  'created_at',
  'created_by',
  'updated_at',
  'updated_by',
  'tags',
];

const bdmSettingSchema = new mongoose.Schema({
  created_at: {
    type: Date,
    default: Date.now,
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
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

bdmSettingSchema.pre('save', async function (next) {
  /**
   * tags
   */
  if (this.isModified('name')) {
    this.tags = [
      ...this.tags,
      ...ngramsAlgov2(this.name.toLowerCase().trim(), 'name'),
    ];
  }
  if (this.isModified('ifa')) {
    const ifa = await User.findById(this.ifa).lean();
    this.ifa_name = `${ifa.first_name.toLowerCase().trim()} ${ifa.last_name
      .toLowerCase()
      .trim()}`;
    this.tags = [...this.tags, ...ngramsAlgov2(ifa._id.toString(), 'ifa')];
  }
  if (this.isModified('bdm')) {
    const bdm = await User.findById(this.bdm).lean();
    this.bdm_name = `${bdm.first_name.toLowerCase().trim()} ${bdm.last_name
      .toLowerCase()
      .trim()}`;
    this.tags = [...this.tags, ...ngramsAlgov2(bdm._id.toString(), 'bdm')];
  }
  if (this.isModified('status')) {
    this.tags = [
      ...this.tags,
      ...ngramsAlgov2(this.status.toLowerCase().trim(), 'status'),
    ];
  }
  next();
});

bdmSettingSchema.post('save', async function () {
  /**
   * logs
   */
  let previous = {};
  let current = {};
  let modified = [];
  const bdm_setting_log = new BdmSettingLog();
  bdm_setting_log.setting_id = this._id;
  if (this.isNew) {
    for (const property in bdmSettingSchema.paths) {
      if (!EXCLUDED_FIELDS.includes(property)) {
        previous[property] = '';
        current[property] = this[property] || '';
        if (this[property]) {
          modified.push(property);
        }
      }
    }
  } else {
    for (const property in bdmSettingSchema.paths) {
      if (!EXCLUDED_FIELDS.includes(property)) {
        previous[property] = this[`old_${property}`] || '';
        current[property] = this[property] || '';
        if (this.isModified(property)) {
          modified.push(property);
        }
      }
    }
  }
  bdm_setting_log.current = current;
  bdm_setting_log.previous = previous;
  bdm_setting_log.modified = modified;
  bdm_setting_log.created_by = this.updated_by;
  await bdm_setting_log.save();
});

/**
 * search index
 */
bdmSettingSchema.index({ 'tags.tag': 1, _id: 1 });

bdmSettingSchema.plugin(mongoosePaginate);

module.exports = {
  BdmSetting: mongoose.model('BdmSetting', bdmSettingSchema),
};
