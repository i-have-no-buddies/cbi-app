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
  current: {
    type: Object,
  },
  previous: {
    type: Object,
  },
  modified: {
    type: Array,
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

userLogSchema.plugin(mongoosePaginate);

module.exports = {
  UserLog: mongoose.model('UserLog', userLogSchema),
};
