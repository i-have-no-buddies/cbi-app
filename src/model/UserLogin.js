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
  this.tags = [];
  if (this.user._id.toString()) {
    this.tags = [
      ...this.tags,
      ...ngramsAlgov2(this.user._id.toString(), '_id'),
    ];
  }
  if (this.user.first_name) {
    this.tags = [
      ...this.tags,
      ...ngramsAlgov2(this.user.first_name.trim().toLowerCase(), 'first_name'),
    ];
  }
  if (this.user.last_name) {
    this.tags = [
      ...this.tags,
      ...ngramsAlgov2(
        this.user.last_name.trim().toLowerCase(),
        'last_name'
      ),
    ];
  }
  if (this.user.type) {
    this.tags = [
      ...this.tags,
      ...ngramsAlgov2(this.user.type.toLowerCase(), 'type'),
    ];
  }
  if (this.type) {
    this.tags = [
      ...this.tags,
      ...ngramsAlgov2(this.type.toLowerCase(), 'login'),
    ];
  }
  next();
});

/**
 * search index
 */
userLoginSchema.index({ 'tags.tag': 1, _id: 1 });
/**
 * report index
 */
userLoginSchema.index({ created_at: 1 });

userLoginSchema.plugin(mongoosePaginate);

module.exports = {
  UserLogin: mongoose.model('UserLogin', userLoginSchema),
  LOGIN_TYPE,
};
