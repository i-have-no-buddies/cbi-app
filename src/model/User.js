const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const mongoosePaginate = require('mongoose-paginate-v2');
const { ngramsAlgov2 } = require('../utils/helper');

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
  },
  last_name: {
    type: String,
    trim: true,
  },
  phone_number: {
    type: String,
    trim: true,
    default: '',
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
    const name = `${user.first_name.trim()} ${user.last_name.trim()}`;
    user.tags = [
      ...ngramsAlgov2(name.toLowerCase(), 'name'),
      ...ngramsAlgov2(user.type.toLowerCase(), 'type'),
      ...ngramsAlgov2(user.type.toLowerCase(), 'status'),
    ];
  }
});

userSchema.pre('insertMany', async (next, docs) => {
  for (const doc of docs) {
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
