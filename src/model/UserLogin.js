const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const LOGIN_TYPE = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
};

const userLogingSchema = new mongoose.Schema({
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  type: {
    type: Object,
  },
});

userLogingSchema.plugin(mongoosePaginate);

module.exports = {
  UserLogin: mongoose.model('UserLogin', userLogingSchema),
  LOGIN_TYPE,
};
