const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { ngramsAlgov2 } = require('../utils/helper');

const LOGIN_TYPE = {
  LOG_IN: 'LOG_IN',
  LOG_OUT: 'LOG_OUT',
};

const userLoginSchema = new mongoose.Schema({
  created_at: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: Object,
  },
  type: {
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

userLoginSchema.pre('save', async function (next) {
  const user_login = this;
  user_login.tags = [
    ...ngramsAlgov2(user_login.user._id.toString(), '_id'),
    ...ngramsAlgov2(
      user_login.user.first_name.trim().toLowerCase(),
      'first_name'
    ),
    ...ngramsAlgov2(user_login.user.last_name.trim().toLowerCase(), 'last_name'),
    ...ngramsAlgov2(user_login.user.type.toLowerCase(), 'type'),
    ...ngramsAlgov2(user_login.type.toLowerCase(), 'login'),
  ];
  next();
});

/**
 * search index
 */
userLoginSchema.index({ 'tags.tag': 1, _id: 1 });

userLoginSchema.plugin(mongoosePaginate);

module.exports = {
  UserLogin: mongoose.model('UserLogin', userLoginSchema),
  LOGIN_TYPE,
};
