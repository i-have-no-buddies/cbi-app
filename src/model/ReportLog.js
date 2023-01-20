const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const REPORT_TYPE = {
  USERS: 'USERS',
  USER_LOGS: 'USER_LOGS',
  USER_LOGINS: 'USER_LOGINS',
};

const reportLogSchema = new mongoose.Schema({
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,
  },
  filter: {
    type: Object,
  },
});

reportLogSchema.plugin(mongoosePaginate);

module.exports = {
  ReportLog: mongoose.model('ReportLog', reportLogSchema),
  REPORT_TYPE,
};
