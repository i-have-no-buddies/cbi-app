const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const userLogSchema = new mongoose.Schema({
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
  data: {
    type: Object,
  },
});

userLogSchema.plugin(mongoosePaginate);

module.exports = {
  UserLog: mongoose.model('UserLog', userLogSchema),
};
