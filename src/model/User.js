const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const mongoosePaginate = require('mongoose-paginate-v2');
const { ngramsAlgo } = require('../utils/helper');

const PHONE_REGEX = /^\d{7,20}$/;

const USER_TYPE = {
  SUPER_ADMIN: 'SUPER ADMIN',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
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
  },
  last_name: {
    type: String,
    trim: true,
  },
  phone_number: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
  },
  type: {
    type: String,
  },
  status: {
    type: String,
    default: USER_STATUS.ACTIVE,
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
  const user = this;
  if (user.password && user.isModified('password')) {
    user.password = await bcryptjs.hash(user.password, 8);
  }
  if (
    user.isModified('first_name') ||
    user.isModified('last_name') ||
    user.isModified('email') ||
    user.isModified('type') ||
    user.isModified('status')
  ) {
    user.tags = [
      ...ngramsAlgo(
        `${user.first_name.toLowerCase().trim()} ${user.last_name
          .toLowerCase()
          .trim()}`,
        'tag'
      ),
      {
        tag: user.email.toLowerCase(),
      },
      { tag: user.type.toLowerCase() },
      { tag: user.status.toLowerCase() },
    ];
  }
});

userSchema.pre('insertMany', async (next, docs) => {
  for (const doc of docs) {
    doc.password = await bcryptjs.hash(doc.password, 8);
    doc.tags = [
      ...ngramsAlgo(
        `${doc.first_name.toLowerCase().trim()} ${doc.last_name
          .toLowerCase()
          .trim()}`,
        'tag'
      ),
      {
        tag: doc.email.toLowerCase(),
      },
      { tag: doc.type.toLowerCase() },
      { tag: doc.status.toLowerCase() },
    ];
  }
});

userSchema.static('getActiveManager', function () {
  return this.find({
    type: USER_TYPE.MANAGER,
    status: USER_STATUS.ACTIVE,
  }).select('_id first_name last_name type');
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

userSchema.plugin(mongoosePaginate);

userSchema.index({ email: 1 });
userSchema.index({ 'tags.tag': 1, _id: 1 });
userSchema.index({ type: 1, status: 1 });

module.exports = {
  User: mongoose.model('User', userSchema),
  PHONE_REGEX,
  USER_TYPE,
  USER_STATUS,
};
