const mongoose = require('mongoose')
const { ObjectId } = require('mongodb')
const mongoosePaginate = require('mongoose-paginate-v2')

const statusLogSchema = new mongoose.Schema({
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
  status: {
    type: String,
    required: true,
  },
  note: {
    type: String,
    required: true,
  },
  attachement: {
    type: String,
  },
  date_time: {
    type: Date,
  },
  address: {
    type: String,
  },
  product: {
    type: String,
  },
  program: {
    type: String,
  },
  outcome: {
    type: String,
  },
  outcome_note: {
    type: String,
  },
  outcome_attachement: {
    type: String,
  },
  outcome_date: {
    type: Date,
  },
})

statusLogSchema.plugin(mongoosePaginate)
statusLogSchema.index({ status: 1, outcome: 1, lead_id: 1 })

statusLogSchema.static('getLeadMeetings', function (lead_id) {
  return this.find({
    status: 'MEETING',
    outcome: { $exists: false },
    lead_id: ObjectId(lead_id),
  }).select('_id note date_time address')
})

module.exports = {
  StatusLog: mongoose.model('StatusLog', statusLogSchema),
}
