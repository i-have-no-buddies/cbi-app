const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { ngramsAlgov2 } = require('../utils/helper');

const LOGIN_TYPE = {
  LOGIN: 'LOG_IN',
  LOGOUT: 'LOG_OUT',
};

const userLogingSchema = new mongoose.Schema({
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

userLogingSchema.pre('save', async function () {
  const user_login = this;
  const name = `${user_login.user.first_name.trim()} ${user_login.user.last_name.trim()}`;
  user_login.tags = [
    ...ngramsAlgov2(name.toLowerCase(), 'name'),
    ...ngramsAlgov2(user_login.type.toLowerCase(), 'type'),
  ];
});

userLogingSchema.index({ 'tags.tag': 1, _id: 1 });

userLogingSchema.plugin(mongoosePaginate);

module.exports = {
  UserLogin: mongoose.model('UserLogin', userLogingSchema),
  LOGIN_TYPE,
};
