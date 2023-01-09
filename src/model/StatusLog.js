const mongoose = require('mongoose')
const { ObjectId } = require('mongodb')
const mongoosePaginate = require('mongoose-paginate-v2')
const { ngramsAlgov2, logDescriptionFormater } = require('../utils/helper');
const { LeadUpdateLog, LOG_TYPE } = require('../model/LeadUpdateLog');
const { User } = require('../model/User');

const EXCLUDED_FIELDS = [
  '_id',
  '__v',
  'created_at',
  'created_by',
  'updated_at',
  'updated_by',
];

const statusLogSchema = new mongoose.Schema({
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  updated_at: {
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
    default: '',
    set: function (status) {
      this.old_status = this.status;
      return status;
    },
  },
  note: {
    type: String,
    required: true,
    default: '',
    set: function (note) {
      this.old_note = this.note;
      return note;
    },
  },
  date_time: {
    type: Date,
    default: '',
    set: function (date_time) {
      this.old_date_time = this.date_time;
      return date_time;
    },
  },
  address: {
    type: String,
    default: '',
    set: function (address) {
      this.old_address = this.address;
      return address;
    },
  },
  product: {
    type: String,
    default: '',
    set: function (product) {
      this.old_product = this.product;
      return product;
    },
  },
  program: {
    type: String,
    default: '',
    set: function (program) {
      this.old_program = this.program;
      return program;
    },
  },
  outcome: {
    type: String,
    default: '',
    set: function (outcome) {
      this.old_outcome = this.outcome;
      return outcome;
    },
  },
  outcome_note: {
    type: String,
    default: '',
    set: function (outcome_note) {
      this.old_outcome_note = this.outcome_note;
      return outcome_note;
    },
  },
  outcome_date: {
    type: Date,
    default: '',
    set: function (outcome_date) {
      this.old_outcome_date = this.outcome_date;
      return outcome_date;
    },
  },
})


statusLogSchema.pre('save', async function (next) {  
  /**
   * logs
   */
  let previous = {};
  let current = {};
  let modified = [];
  const lead_update_log = new LeadUpdateLog();
  if (this.isNew) {
    for (const property in statusLogSchema.paths) {
      if (!EXCLUDED_FIELDS.includes(property)) {
        previous[property] = '';
        current[property] = this[property] || '';
        if (this[property]) {
          modified.push(property);
        }
      }
    }
  } else {
    for (const property in statusLogSchema.paths) {
      if (!EXCLUDED_FIELDS.includes(property)) {
        previous[property] = this[`old_${property}`] || '';
        current[property] = this[property] || '';
        if (this.isModified(property)) {
          modified.push(property);
        }
      }
    }
  }
  
  // //think of module
  let user = await User.findById(this.updated_by).lean()
  var log_type = this.isNew? LOG_TYPE.CREATE : LOG_TYPE.UPDATE
  var description = logDescriptionFormater(user, log_type, this.status)

  lead_update_log.lead_id = this['lead_id'],
  lead_update_log.status_log_id = this['_id'],
  lead_update_log.log_type = log_type;
  lead_update_log.description = description;
  lead_update_log.current = current;
  lead_update_log.previous = previous;
  lead_update_log.modified = modified;
  lead_update_log.created_by = this.updated_by;
  await lead_update_log.save();
  next();
});

statusLogSchema.index({ status: 1, outcome: 1, lead_id: 1 })

statusLogSchema.static('getLeadMeetings', function (lead_id) {
  return this.find({
    status: 'MEETING',
    outcome: '',
    lead_id: ObjectId(lead_id),
  }).select('_id note date_time address')
})

statusLogSchema.plugin(mongoosePaginate)

module.exports = {
  StatusLog: mongoose.model('StatusLog', statusLogSchema),
}
