const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
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

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    trim: true,
    set: function (first_name) {
      this.old_first_name = this.first_name;
      return first_name;
    },
  },
  last_name: {
    type: String,
    trim: true,
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
    unique: true,
    set: function (email) {
      this.old_email = this.email;
      return email;
    },
  },
  password: {
    type: String,
    set: function (password) {
      this.old_password = this.password;
      return password;
    },
  },
  type: {
    type: String,
    set: function (type) {
      this.old_type = this.type;
      return type;
    },
  },
  status: {
    type: String,
    default: USER_STATUS.ACTIVE,
    set: function (status) {
      this.old_status = this.status;
      return status;
    },
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

userSchema.pre('save', async function () {
  console.log(Object.keys(userSchema.paths));
  const user = this;
  /**
   * tags
   */
  if (
    user.isModified('first_name') ||
    user.isModified('last_name') ||
    user.isModified('email') ||
    user.isModified('type') ||
    user.isModified('status')
  ) {
    const name = `${user.first_name.trim()} ${user.last_name.trim()}`;
    user.tags = [
      ...ngramsAlgov2(name.toLowerCase(), 'name'),
      ...ngramsAlgov2(user.type.toLowerCase(), 'type'),
      ...ngramsAlgov2(user.type.toLowerCase(), 'status'),
    ];
  }
  /**
   * user logs
   */
  const current = {};
  const previous = {};
  const modified = [];
  for (const row in user) {
    if (!row.startsWith('old_')) {
      if (user.isModified(row)) {
        modified.push(row);
      }
    }
    if (row.startsWith('old_')) {
      const property = row.replace(/^old_/, '');
      current[property] = user[property];
      // this.isNew for new data save
      // each schema has paths
      previous[property] = user[row];
    }
  }
  if (user.isModified('password')) {
    user.password = await bcryptjs.hash(user.password, 8);
    current.password = user.password;
  }
  const tags = [...ngramsAlgov2(user._id.toString(), '_id')];
  const user_log = new UserLog({
    current,
    previous,
    modified,
    tags,
  });
  await user_log.save();
});

userSchema.pre('insertMany', async (next, docs) => {
  for (const doc of docs) {
    /**
     * tags
     */
    const name = `${doc.first_name.trim()} ${doc.last_name.trim()}`;
    doc.password = await bcryptjs.hash(doc.password, 8);
    doc.tags = [
      ...ngramsAlgov2(name.toLowerCase(), 'name'),
      ...ngramsAlgov2(doc.type.toLowerCase(), 'type'),
      ...ngramsAlgov2(doc.type.toLowerCase(), 'status'),
    ];
  }
});

userSchema.static('getActiveIfa', function () {
  return this.find({ type: USER_TYPE.IFA, status: USER_STATUS.ACTIVE }).select(
    '_id first_name last_name type'
  );
});

userSchema.static('getActiveBdm', function () {
  return this.find({
    type: USER_TYPE.BDM,
    status: USER_STATUS.ACTIVE,
  }).select('_id first_name last_name type');
});

userSchema.index({ email: 1 });
userSchema.index({ 'tags.tag': 1, _id: 1 });
userSchema.index({ type: 1, status: 1 });

userSchema.plugin(mongoosePaginate);

module.exports = {
  User: mongoose.model('User', userSchema),
  PHONE_REGEX,
  USER_TYPE,
  USER_STATUS,
};
