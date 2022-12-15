const mongoose = require('mongoose');
const { ObjectId } = require('mongodb')
const mongoosePaginate = require('mongoose-paginate-v2');

const LOG_TYPE = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
}

const MODULE = {
  LEAD: 'LEAD',
  LEAD_MANAGEMENT: 'LEAD_MANAGEMENT',
}

const leadUpdateLogSchema = new mongoose.Schema({
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  lead_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
  },
  status_log_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StatusLog',
  },
  module: {
    type: String
  },
  log_type: {
    type: String
  },
  description: {
    type: String
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


leadUpdateLogSchema.static('getUpdateLogs', function (lead_id) {
  return this.find({
    lead_id: ObjectId(lead_id),
  })
  .sort({'created_at': 1})
  .select('_id created_by created_at module description log_type')
})

leadUpdateLogSchema.plugin(mongoosePaginate);

module.exports = {
  LeadUpdateLog: mongoose.model('LeadUpdateLog', leadUpdateLogSchema),
  LOG_TYPE
};
