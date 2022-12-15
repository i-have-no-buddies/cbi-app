const mongoose = require('mongoose')
const { ObjectId } = require('mongodb')
const mongoosePaginate = require('mongoose-paginate-v2')
const { ngramsAlgov2, logDescriptionFormater } = require('../utils/helper');
const { LeadUpdateLog, LOG_TYPE } = require('../model/LeadUpdateLog');

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
    set: function (status) {
      this.old_status = this.status;
      return status;
    },
  },
  note: {
    type: String,
    required: true,
    set: function (note) {
      this.old_note = this.note;
      return note;
    },
  },
  date_time: {
    type: Date,
    set: function (date_time) {
      this.old_date_time = this.date_time;
      return date_time;
    },
  },
  address: {
    type: String,
    set: function (address) {
      this.old_address = this.address;
      return address;
    },
  },
  product: {
    type: String,
    set: function (product) {
      this.old_product = this.product;
      return product;
    },
  },
  program: {
    type: String,
    set: function (program) {
      this.old_program = this.program;
      return program;
    },
  },
  outcome: {
    type: String,
    set: function (outcome) {
      this.old_outcome = this.outcome;
      return outcome;
    },
  },
  outcome_note: {
    type: String,
    set: function (outcome_note) {
      this.old_outcome_note = this.outcome_note;
      return outcome_note;
    },
  },
  outcome_date: {
    type: Date,
    set: function (outcome_date) {
      this.old_outcome_date = this.outcome_date;
      return outcome_date;
    },
  },
})


statusLogSchema.pre('save', async function (next, session, callback) {
  const status = this;
  status.created_by = session._id
  /**
   * status logs
   */
  var current = {};
  var previous = {};
  const modified = [];
  
  for (const row in status) {
    if (!row.startsWith('old_')) {
      if (status.isModified(row)) {
        modified.push(row);
      }
    }
    
    if (row.startsWith('old_')) {
      const property = row.replace(/^old_/, '');
      current[property] = status[property];
      // this.isNew for new data save
      // each schema has paths
      previous[property] = status[row];
    }
  }

  //think of module
  var log_type = status.isNew? LOG_TYPE.CREATE : LOG_TYPE.UPDATE
  var description = logDescriptionFormater(session, log_type, status.status)

  //might change depending on the conditions
  //bottom is meeting updated
  if(log_type == LOG_TYPE.UPDATE) {
    let copy_fields = ['lead_id','note','status','date_time','address']
    
    copy_fields.forEach((field) => {
      current[field] = status[field];
      previous[field] = status[field];
    });
  }

  const tags = []
  //const tags = [...ngramsAlgov2(user._id.toString(), '_id')];
  const lead_update_log = new LeadUpdateLog({
    //module,
    description,
    lead_id: status.lead_id,
    status_log_id: status._id,
    created_by: session._id,
    log_type,
    current,
    previous,
    modified,
    tags,
  });
  await lead_update_log.save();
});

statusLogSchema.index({ status: 1, outcome: 1, lead_id: 1 })

statusLogSchema.static('getLeadMeetings', function (lead_id) {
  return this.find({
    status: 'MEETING',
    outcome: { $exists: false },
    lead_id: ObjectId(lead_id),
  }).select('_id note date_time address')
})

statusLogSchema.plugin(mongoosePaginate)

module.exports = {
  StatusLog: mongoose.model('StatusLog', statusLogSchema),
}
