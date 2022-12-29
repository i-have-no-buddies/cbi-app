const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { ngramsAlgov2 } = require('../utils/helper');
const { UserLog } = require('../model/UserLog');

const PHONE_REGEX = /^\d{7,20}$/;

const USER_TYPE = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  IFA: 'IFA',
  BDM: 'BDM',
};

const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

const EXCLUDED_FIELDS = [
  '_id',
  '__v',
  'created_at',
  'created_by',
  'updated_at',
  'updated_by',
  'tags',
];

const userSchema = new mongoose.Schema({
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
  first_name: {
    type: String,
    trim: true,
    default: '',
    set: function (first_name) {
      this.old_first_name = this.first_name;
      return first_name;
    },
  },
  last_name: {
    type: String,
    trim: true,
    default: '',
    set: function (last_name) {
      this.old_last_name = this.last_name;
      return last_name;
    },
  },
  phone_number: {
    type: String,
    trim: true,
    default: '',
    set: function (phone_number) {
      this.old_phone_number = this.phone_number;
      return phone_number;
    },
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    default: '',
    set: function (email) {
      this.old_email = this.email;
      return email;
    },
  },
  password: {
    type: String,
    default: '',
    set: function (password) {
      this.old_password = this.password;
      return password;
    },
  },
  type: {
    type: String,
    default: '',
    set: function (type) {
      this.old_type = this.type;
      return type;
    },
  },
  status: {
    type: String,
    default: '',
    set: function (status) {
      this.old_status = this.status;
      return status;
    },
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

userSchema.pre('save', async function (next) {
  /**
   * tags
   */
  if (this.first_name) {
    this.tags = [
      ...this.tags,
      ...ngramsAlgov2(this.first_name.toLowerCase(), 'first_name'),
    ];
  }
  if (this.last_name) {
    this.tags = [
      ...this.tags,
      ...ngramsAlgov2(this.last_name.toLowerCase(), 'last_name'),
    ];
  }
  if (this.email) {
    this.tags = [
      ...this.tags,
      ...ngramsAlgov2(this.email.toLowerCase(), 'email'),
    ];
  }
  if (this.type) {
    this.tags = [
      ...this.tags,
      ...ngramsAlgov2(this.type.toLowerCase(), 'type'),
    ];
  }
  if (this.status) {
    this.tags = [
      ...this.tags,
      ...ngramsAlgov2(this.status.toLowerCase(), 'status'),
    ];
  }
  /**
   * logs
   */
  let previous = {};
  let current = {};
  let modified = [];
  const user_log = new UserLog();
  user_log.user_id = this._id;
  if (this.isNew) {
    for (const property in userSchema.paths) {
      if (!EXCLUDED_FIELDS.includes(property)) {
        previous[property] = '';
        current[property] = this[property] || '';
        if (this[property]) {
          modified.push(property);
        }
      }
    }
  } else {
    for (const property in userSchema.paths) {
      if (!EXCLUDED_FIELDS.includes(property)) {
        previous[property] = this[`old_${property}`] || '';
        current[property] = this[property] || '';
        if (this.isModified(property)) {
          modified.push(property);
        }
      }
    }
  }
  user_log.current = current;
  user_log.previous = previous;
  user_log.modified = modified;
  user_log.created_by = this.updated_by;
  await user_log.save();
  next();
});

userSchema.static('getActiveIfa', function () {
  return this.find({
    type: USER_TYPE.IFA,
    status: USER_STATUS.ACTIVE,
  }).select('_id first_name last_name type');
});

userSchema.static('getActiveBdm', function () {
  return this.find({
    type: USER_TYPE.BDM,
    status: USER_STATUS.ACTIVE,
  }).select('_id first_name last_name type');
});

/**
 * login index
 */
userSchema.index({ email: 1 });
/**
 * search index
 */
userSchema.index({ 'tags.tag': 1, _id: 1 });
/**
 * model static function
 */
userSchema.index({ type: 1, status: 1 });

userSchema.plugin(mongoosePaginate);

module.exports = {
  User: mongoose.model('User', userSchema),
  PHONE_REGEX,
  USER_TYPE,
  USER_STATUS,
};
