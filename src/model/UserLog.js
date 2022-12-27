const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { ngramsAlgov2 } = require('../utils/helper');

const userLogSchema = new mongoose.Schema({
  created_at: {
    type: Date,
    default: Date.now,
  },
  created_by: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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

userLogSchema.pre('save', async function (next) {
  const user_log = this;
  user_log.tags = [
    ...ngramsAlgov2(user_log.user_id.toString(), '_id'),
    ...ngramsAlgov2(
      user_log.current.first_name.trim().toLowerCase(),
      'first_name'
    ),
    ...ngramsAlgov2(user_log.current.last_name.trim().toLowerCase(), 'last_name'),
    ...ngramsAlgov2(user_log.current.type.toLowerCase(), 'type'),
  ];
  next();
});

/**
 * search index
 */
userLogSchema.index({ 'tags.tag': 1, _id: 1 });

userLogSchema.plugin(mongoosePaginate);

module.exports = {
  UserLog: mongoose.model('UserLog', userLogSchema),
};
